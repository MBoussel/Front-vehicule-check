import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import { getContractById } from "../../api/contractApi";
import {
  completeCheck,
  createCheck,
  getCheckById,
  getChecks,
  uploadCheckPhoto,
} from "../../api/checkApi";
import { createPhotoDamage } from "../../api/checkDamageApi";
import PhotoStep from "../../components/Check/PhotoStep";
import { REQUIRED_CHECK_STEPS } from "../../constants/checkSteps";
import {
  getActiveCheckId,
  removeActiveCheckId,
  saveActiveCheckId,
} from "../../utils/checkStorage";

import type { RentalContract } from "../../types/contract";
import type {
  Check,
  CheckStatus,
  CheckType,
  CleanlinessLevel,
  FuelLevel,
  PhotoType,
} from "../../types/check";
import type { DamagePoint } from "../../types/checkDamage";

import "./CheckCreatePage.css";

type ApiValidationErrorItem = {
  loc?: unknown;
  msg?: unknown;
};

type ApiError = {
  response?: {
    data?: {
      detail?: unknown;
    };
  };
};

function extractApiErrorMessage(error: unknown): string {
  const apiError = error as ApiError;
  const detail = apiError.response?.data?.detail;

  if (typeof detail === "string") return detail;

  if (Array.isArray(detail) && detail.length > 0) {
    return detail
      .map((item: ApiValidationErrorItem) => {
        const location = Array.isArray(item.loc)
          ? item.loc.join(" > ")
          : "body";

        const message =
          typeof item.msg === "string" ? item.msg : "Erreur de validation";

        return `${location}: ${message}`;
      })
      .join(" | ");
  }

  return "Une erreur est survenue.";
}

function getCompletedPhotoTypesFromCheck(check: Check): Set<PhotoType> {
  return new Set(
    (check.photos ?? [])
      .filter((photo) => photo.photo_type !== "other")
      .map((photo) => photo.photo_type),
  );
}

function getOtherPhotoCountFromCheck(check: Check): number {
  return (check.photos ?? []).filter((photo) => photo.photo_type === "other")
    .length;
}

function getNextStepIndexFromCompletedTypes(
  completedTypes: Set<PhotoType>,
): number {
  const nextMissingIndex = REQUIRED_CHECK_STEPS.findIndex(
    (step) => !completedTypes.has(step.type),
  );

  return nextMissingIndex === -1
    ? REQUIRED_CHECK_STEPS.length
    : nextMissingIndex;
}

function getLatestDraftCheckForContract(
  checks: Check[],
  contractId: number,
  typeCheck: CheckType,
): Check | null {
  const matchingChecks = checks.filter(
    (check) =>
      check.contract_id === contractId &&
      check.type_check === typeCheck &&
      check.status !== "completed",
  );

  if (matchingChecks.length === 0) return null;

  return [...matchingChecks].sort((a, b) => {
    const dateA = new Date(checkDateOrCreatedAt(a)).getTime();
    const dateB = new Date(checkDateOrCreatedAt(b)).getTime();
    return dateB - dateA;
  })[0] ?? null;
}

function getCompletedDepartureCheck(
  checks: Check[],
  contractId: number,
): Check | null {
  const matchingChecks = checks.filter(
    (check) =>
      check.contract_id === contractId &&
      check.type_check === "departure" &&
      check.status === "completed",
  );

  if (matchingChecks.length === 0) return null;

  return [...matchingChecks].sort((a, b) => {
    const dateA = new Date(checkDateOrCreatedAt(a)).getTime();
    const dateB = new Date(checkDateOrCreatedAt(b)).getTime();
    return dateB - dateA;
  })[0] ?? null;
}

function checkDateOrCreatedAt(check: Check): string | number {
  return check.check_date ?? check.created_at ?? 0;
}

function CheckCreatePage() {
  const { contractId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const requestedType: CheckType =
    searchParams.get("type") === "return" ? "return" : "departure";

  const [contract, setContract] = useState<RentalContract | null>(null);
  const [isLoadingContract, setIsLoadingContract] = useState(true);

  const [typeCheck, setTypeCheck] = useState<CheckType>(requestedType);
  const [mileage, setMileage] = useState("");
  const [departureMileage, setDepartureMileage] = useState<number | null>(null);
  const [fuelLevel, setFuelLevel] = useState<FuelLevel>("half");
  const [cleanliness, setCleanliness] =
    useState<CleanlinessLevel>("clean");
  const [notes, setNotes] = useState("");
  const [, setStatus] = useState<CheckStatus>("draft");

  const [checkId, setCheckId] = useState<number | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [completedRequiredTypes, setCompletedRequiredTypes] = useState<
    Set<PhotoType>
  >(() => new Set());

  const [isCreatingCheck, setIsCreatingCheck] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isCompletingCheck, setIsCompletingCheck] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [otherPhotoCount, setOtherPhotoCount] = useState(0);
  const [resumeMessage, setResumeMessage] = useState("");

  useEffect(() => {
    async function loadContractAndResolveCheck() {
      if (!contractId) {
        setErrorMessage("Contrat introuvable.");
        setIsLoadingContract(false);
        return;
      }

      try {
        setIsLoadingContract(true);
        setErrorMessage("");
        setResumeMessage("");
        setCheckId(null);
        setStepIndex(0);
        setCompletedRequiredTypes(new Set());

        const numericContractId = Number(contractId);
        const contractData = await getContractById(numericContractId);
        const allChecks = await getChecks();

        const completedDepartureCheck = getCompletedDepartureCheck(
          allChecks,
          numericContractId,
        );

        setContract(contractData);
        setTypeCheck(requestedType);
        setDepartureMileage(completedDepartureCheck?.mileage ?? null);

        const defaultMileage =
          requestedType === "return" && completedDepartureCheck
            ? completedDepartureCheck.mileage
            : contractData.vehicle?.current_mileage ?? "";

        setMileage(String(defaultMileage));

        const storedCheckId = getActiveCheckId(numericContractId);

        if (storedCheckId) {
          const storedCheck = await getCheckById(storedCheckId);

          if (
            storedCheck.contract_id !== numericContractId ||
            storedCheck.type_check !== requestedType
          ) {
            removeActiveCheckId(numericContractId);
          } else if (storedCheck.status !== "completed") {
            const completedTypes = getCompletedPhotoTypesFromCheck(storedCheck);
            const nextIndex = getNextStepIndexFromCompletedTypes(completedTypes);

            setCheckId(storedCheck.id);
            setTypeCheck(storedCheck.type_check ?? requestedType);
            setMileage(String(storedCheck.mileage ?? defaultMileage));
            setFuelLevel(storedCheck.fuel_level ?? "half");
            setCleanliness(storedCheck.cleanliness ?? "clean");
            setNotes(storedCheck.notes ?? "");
            setStatus(storedCheck.status ?? "draft");
            setOtherPhotoCount(getOtherPhotoCountFromCheck(storedCheck));
            setCompletedRequiredTypes(completedTypes);
            setStepIndex(nextIndex);
            setResumeMessage(
              `Check brouillon repris automatiquement (#${storedCheck.id}).`,
            );
            return;
          } else {
            removeActiveCheckId(numericContractId);
          }
        }

        const latestDraftCheck = getLatestDraftCheckForContract(
          allChecks,
          numericContractId,
          requestedType,
        );

        if (latestDraftCheck && latestDraftCheck.status !== "completed") {
          const fullCheck = await getCheckById(latestDraftCheck.id);
          const completedTypes = getCompletedPhotoTypesFromCheck(fullCheck);
          const nextIndex = getNextStepIndexFromCompletedTypes(completedTypes);

          saveActiveCheckId(numericContractId, fullCheck.id);
          setCheckId(fullCheck.id);
          setTypeCheck(fullCheck.type_check ?? requestedType);
          setMileage(String(fullCheck.mileage ?? defaultMileage));
          setFuelLevel(fullCheck.fuel_level ?? "half");
          setCleanliness(fullCheck.cleanliness ?? "clean");
          setNotes(fullCheck.notes ?? "");
          setStatus(fullCheck.status ?? "draft");
          setOtherPhotoCount(getOtherPhotoCountFromCheck(fullCheck));
          setCompletedRequiredTypes(completedTypes);
          setStepIndex(nextIndex);
          setResumeMessage(
            `Check brouillon repris automatiquement (#${fullCheck.id}).`,
          );
        }
      } catch {
        setErrorMessage("Impossible de charger le contrat ou le check en cours.");
      } finally {
        setIsLoadingContract(false);
      }
    }

    void loadContractAndResolveCheck();
  }, [contractId, requestedType]);

  const isOnRequiredSteps = stepIndex < REQUIRED_CHECK_STEPS.length;

  const currentStep = useMemo(() => {
    if (!isOnRequiredSteps) return null;
    return REQUIRED_CHECK_STEPS[stepIndex];
  }, [isOnRequiredSteps, stepIndex]);

  const numericMileage = mileage.trim() ? Number(mileage) : null;

  const mileageDifference =
    typeCheck === "return" &&
    departureMileage !== null &&
    numericMileage !== null &&
    !Number.isNaN(numericMileage)
      ? numericMileage - departureMileage
      : null;

  function markRequiredStepCompleted(photoType: PhotoType) {
    setCompletedRequiredTypes((previous) => {
      const next = new Set(previous);
      next.add(photoType);
      return next;
    });
  }

  function goToNextStep() {
    setStepIndex((previous) =>
      Math.min(previous + 1, REQUIRED_CHECK_STEPS.length),
    );
  }

  function goToPreviousStep() {
    setErrorMessage("");
    setStepIndex((previous) => Math.max(previous - 1, 0));
  }

  async function handleCreateCheck(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!contract) {
      setErrorMessage("Contrat introuvable.");
      return;
    }

    if (!mileage.trim()) {
      setErrorMessage("Renseigne le kilométrage.");
      return;
    }

    const mileageValue = Number(mileage);

    if (Number.isNaN(mileageValue)) {
      setErrorMessage("Le kilométrage doit être un nombre valide.");
      return;
    }

    if (
      typeCheck === "return" &&
      departureMileage !== null &&
      mileageValue < departureMileage
    ) {
      setErrorMessage(
        "Le kilométrage retour ne peut pas être inférieur au kilométrage de départ.",
      );
      return;
    }

    setErrorMessage("");
    setResumeMessage("");
    setIsCreatingCheck(true);

    try {
      const createdCheck = await createCheck({
        vehicle_id: contract.vehicle_id,
        contract_id: contract.id,
        type_check: typeCheck,
        mileage: mileageValue,
        fuel_level: fuelLevel,
        cleanliness,
        notes: notes.trim() || undefined,
        status: "draft",
      });

      setCheckId(createdCheck.id);
      setStepIndex(0);
      setOtherPhotoCount(0);
      setCompletedRequiredTypes(new Set());
      saveActiveCheckId(contract.id, createdCheck.id);
    } catch (error) {
      setErrorMessage(extractApiErrorMessage(error));
    } finally {
      setIsCreatingCheck(false);
    }
  }

  async function sendDamagesForPhoto(photoId: number, damages: DamagePoint[]) {
    for (const damage of damages) {
      await createPhotoDamage(photoId, damage);
    }
  }

  async function handleNoDamageForRequiredStep() {
    if (!currentStep || !contract || !checkId) return;

    setErrorMessage("");

    if (typeCheck === "departure") {
      setErrorMessage("Photo obligatoire pour un check de départ.");
      return;
    }

    markRequiredStepCompleted(currentStep.type);
    saveActiveCheckId(contract.id, checkId);
    goToNextStep();
  }

  async function handlePhotoValidate(payload: {
    file: File;
    damages: DamagePoint[];
  }) {
    if (!checkId || !currentStep || !contract) return;

    setErrorMessage("");
    setIsUploadingPhoto(true);

    try {
      const hasDamage =
        typeCheck === "return" ? true : payload.damages.length > 0;

      const photo = await uploadCheckPhoto(
        checkId,
        payload.file,
        currentStep.type,
        stepIndex + 1,
        hasDamage,
        hasDamage ? "Photo avec dégât" : undefined,
      );

      if (payload.damages.length > 0) {
        await sendDamagesForPhoto(photo.id, payload.damages);
      }

      markRequiredStepCompleted(currentStep.type);
      saveActiveCheckId(contract.id, checkId);
      goToNextStep();
    } catch (error) {
      setErrorMessage(extractApiErrorMessage(error));
    } finally {
      setIsUploadingPhoto(false);
    }
  }

  async function handleOtherPhotoValidate(payload: {
    file: File;
    damages: DamagePoint[];
  }) {
    if (!checkId || !contract) return;

    setErrorMessage("");
    setIsUploadingPhoto(true);

    try {
      const hasDamage = payload.damages.length > 0;

      const photo = await uploadCheckPhoto(
        checkId,
        payload.file,
        "other",
        REQUIRED_CHECK_STEPS.length + otherPhotoCount + 1,
        hasDamage,
        hasDamage ? "Photo supplémentaire avec dégât" : undefined,
      );

      if (payload.damages.length > 0) {
        await sendDamagesForPhoto(photo.id, payload.damages);
      }

      saveActiveCheckId(contract.id, checkId);
      setOtherPhotoCount((previous) => previous + 1);
    } catch (error) {
      setErrorMessage(extractApiErrorMessage(error));
    } finally {
      setIsUploadingPhoto(false);
    }
  }

  async function handleFinishCheck() {
    if (!contract || !checkId) {
      navigate(`/contracts/${contractId}`);
      return;
    }

    setIsCompletingCheck(true);
    setErrorMessage("");

    try {
      await completeCheck(checkId);
      removeActiveCheckId(contract.id);
      navigate(`/checks/${checkId}`);
    } catch (error) {
      setErrorMessage(extractApiErrorMessage(error));
    } finally {
      setIsCompletingCheck(false);
    }
  }

  function handleBackToPreviousRequiredStep() {
    setErrorMessage("");
    setStepIndex(REQUIRED_CHECK_STEPS.length - 1);
  }

  if (isLoadingContract) {
    return <p className="check-create-page__state">Chargement du contrat...</p>;
  }

  if (!contract) {
    return (
      <p className="check-create-page__state check-create-page__state--error">
        {errorMessage || "Contrat introuvable."}
      </p>
    );
  }

  return (
    <section className="check-create-page">
      <header className="check-create-page__header">
        <div>
          <p className="check-create-page__eyebrow">État des lieux</p>
          <h2 className="check-create-page__title">
            Contrat {contract.contract_number}
          </h2>
        </div>

        <p className="check-create-page__description">
          {contract.customer_first_name} {contract.customer_last_name} —{" "}
          {contract.vehicle?.brand} {contract.vehicle?.model}
        </p>

        {checkId ? (
          <p className="check-create-page__check-id">
            Check en cours : #{checkId}
          </p>
        ) : null}

        {resumeMessage ? (
          <p className="check-create-page__resume-message">{resumeMessage}</p>
        ) : null}
      </header>

      {errorMessage ? (
        <p className="check-create-page__state check-create-page__state--error">
          {errorMessage}
        </p>
      ) : null}

      {!checkId ? (
        <form className="check-create-page__form" onSubmit={handleCreateCheck}>
          <section className="check-create-page__section">
            <div className="check-create-page__section-header">
              <h3>Informations du check</h3>
              <p>Prépare le check avant de commencer le parcours.</p>
            </div>

            <div className="check-create-page__grid">
              <label className="check-create-page__field">
                <span>Type de check</span>
                <select
                  value={typeCheck}
                  onChange={(event) =>
                    setTypeCheck(event.target.value as CheckType)
                  }
                >
                  <option value="departure">Départ</option>
                  <option value="return">Retour</option>
                </select>
              </label>

              <label className="check-create-page__field">
                <span>Kilométrage</span>
                <input
                  type="number"
                  min="0"
                  value={mileage}
                  onChange={(event) => setMileage(event.target.value)}
                  required
                />
              </label>

              {typeCheck === "return" && departureMileage !== null ? (
                <div className="check-create-page__mileage-summary">
                  <span>Kilométrage au départ</span>
                  <strong>{departureMileage.toLocaleString("fr-FR")} km</strong>

                  <span>Kilométrage au retour</span>
                  <strong>
                    {numericMileage !== null && !Number.isNaN(numericMileage)
                      ? `${numericMileage.toLocaleString("fr-FR")} km`
                      : "-"}
                  </strong>

                  <span>Distance parcourue</span>
                  <strong>
                    {mileageDifference !== null
                      ? `${mileageDifference.toLocaleString("fr-FR")} km`
                      : "-"}
                  </strong>
                </div>
              ) : null}

              <label className="check-create-page__field">
                <span>Niveau de carburant</span>
                <select
                  value={fuelLevel}
                  onChange={(event) =>
                    setFuelLevel(event.target.value as FuelLevel)
                  }
                >
                  <option value="one_eighth">1/8 ou 0-13%</option>
                  <option value="two_eighths">2/8 ou 14-25%</option>
                  <option value="three_eighths">3/8 ou 26-38%</option>
                  <option value="half">Moitié ou 39-50%</option>
                  <option value="five_eighths">5/8 ou 51-62%</option>
                  <option value="six_eighths">6/8 ou 63-74%</option>
                  <option value="seven_eighths">7/8 ou 75-89%</option>
                  <option value="full">Plein ou 90-100%</option>
                </select>
              </label>

              <label className="check-create-page__field">
                <span>Propreté</span>
                <select
                  value={cleanliness}
                  onChange={(event) =>
                    setCleanliness(event.target.value as CleanlinessLevel)
                  }
                >
                  <option value="very_clean">Très propre</option>
                  <option value="clean">Propre</option>
                  <option value="medium">Moyenne</option>
                  <option value="dirty">Sale</option>
                </select>
              </label>

              <label className="check-create-page__field check-create-page__field--full">
                <span>Notes</span>
                <textarea
                  rows={4}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Observations générales sur le véhicule..."
                />
              </label>
            </div>
          </section>

          <div className="check-create-page__actions">
            <button
              type="button"
              className="check-create-page__secondary-button"
              onClick={() => navigate(`/contracts/${contract.id}`)}
            >
              Retour contrat
            </button>

            <button
              type="submit"
              className="check-create-page__primary-button"
              disabled={isCreatingCheck}
            >
              {isCreatingCheck ? "Création..." : "Commencer le check"}
            </button>
          </div>
        </form>
      ) : isOnRequiredSteps && currentStep ? (
        <div className="check-create-page__wizard">
      <PhotoStep
  key={`${checkId}-${stepIndex}-${currentStep.type}`}
  label={currentStep.label}
  hint={currentStep.hint}
  stepNumber={stepIndex + 1}
  totalSteps={REQUIRED_CHECK_STEPS.length}
  checkType={typeCheck}
  onValidate={handlePhotoValidate}
  onNoDamage={handleNoDamageForRequiredStep}
  onBack={goToPreviousStep}
  canGoBack={stepIndex > 0}
  isCompleted={completedRequiredTypes.has(currentStep.type)}
  onContinue={goToNextStep}
  isSubmitting={isUploadingPhoto}
/>

          <div className="check-create-page__wizard-footer">
            <p className="check-create-page__wizard-progress">
              Étape {stepIndex + 1} sur {REQUIRED_CHECK_STEPS.length}
            </p>

            <div className="check-create-page__wizard-actions">
              <button
                type="button"
                className="check-create-page__secondary-button"
                onClick={() => navigate(`/contracts/${contract.id}`)}
              >
                Quitter
              </button>
            </div>
          </div>
        </div>
      ) : (
        <section className="check-create-page__extras">
          <div className="check-create-page__section-header">
            <h3>Photos supplémentaires</h3>
            <p>Ajoute des photos “autres” si tu veux compléter le dossier.</p>
          </div>

          <PhotoStep
  key={`${checkId}-other-${otherPhotoCount}`}
  label="Photo supplémentaire"
  hint="Ajoute un détail utile : rayure, impact, accessoire, document, etc."
  stepNumber={REQUIRED_CHECK_STEPS.length + 1}
  totalSteps={REQUIRED_CHECK_STEPS.length + 1}
  checkType={typeCheck}
  onValidate={handleOtherPhotoValidate}
  onNoDamage={() => undefined}
  onBack={handleBackToPreviousRequiredStep}
  canGoBack
  isSubmitting={isUploadingPhoto}
/>

          <div className="check-create-page__other-count">
            {otherPhotoCount > 0
              ? `${otherPhotoCount} photo(s) supplémentaire(s) ajoutée(s)`
              : "Aucune photo supplémentaire ajoutée"}
          </div>

          <div className="check-create-page__actions">
            <button
              type="button"
              className="check-create-page__secondary-button"
              onClick={handleBackToPreviousRequiredStep}
            >
              Revenir aux étapes
            </button>

            <button
              type="button"
              className="check-create-page__primary-button"
              onClick={handleFinishCheck}
              disabled={isCompletingCheck}
            >
              {isCompletingCheck ? "Finalisation..." : "Terminer le check"}
            </button>
          </div>
        </section>
      )}
    </section>
  );
}

export default CheckCreatePage;