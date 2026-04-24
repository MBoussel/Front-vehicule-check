const CHECK_STORAGE_KEY = "rental_active_checks";

type ActiveChecksMap = Record<string, number>;

function readStorage(): ActiveChecksMap {
  const rawValue = localStorage.getItem(CHECK_STORAGE_KEY);

  if (!rawValue) {
    return {};
  }

  try {
    const parsedValue = JSON.parse(rawValue) as ActiveChecksMap;

    if (parsedValue && typeof parsedValue === "object") {
      return parsedValue;
    }

    return {};
  } catch {
    return {};
  }
}

function writeStorage(data: ActiveChecksMap): void {
  localStorage.setItem(CHECK_STORAGE_KEY, JSON.stringify(data));
}

export function saveActiveCheckId(contractId: number, checkId: number): void {
  const currentData = readStorage();
  currentData[String(contractId)] = checkId;
  writeStorage(currentData);
}

export function getActiveCheckId(contractId: number): number | null {
  const currentData = readStorage();
  const value = currentData[String(contractId)];

  return typeof value === "number" ? value : null;
}

export function removeActiveCheckId(contractId: number): void {
  const currentData = readStorage();
  delete currentData[String(contractId)];
  writeStorage(currentData);
}