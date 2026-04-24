import type { PhotoType } from "../types/check";

export type CheckStep = {
  type: PhotoType;
  label: string;
  hint: string;
};

export const REQUIRED_CHECK_STEPS: CheckStep[] = [
  {
    type: "front",
    label: "Avant du véhicule",
    hint: "Photo de face, véhicule entier visible.",
  },
  {
    type: "windshield",
    label: "Pare-brise",
    hint: "Photo claire du pare-brise.",
  },
  {
    type: "wheel_front_left",
    label: "Roue avant gauche",
    hint: "Photo de la roue avant gauche.",
  },
  {
    type: "front_left_angle",
    label: "Angle avant gauche",
    hint: "Photo de l’angle avant gauche.",
  },
  {
    type: "rear_left_angle",
    label: "Angle arrière gauche",
    hint: "Photo de l’angle arrière gauche.",
  },
  {
    type: "wheel_rear_left",
    label: "Roue arrière gauche",
    hint: "Photo de la roue arrière gauche.",
  },
  {
    type: "rear",
    label: "Arrière du véhicule",
    hint: "Photo de l’arrière, véhicule entier visible.",
  },
  {
    type: "wheel_rear_right",
    label: "Roue arrière droite",
    hint: "Photo de la roue arrière droite.",
  },
  {
    type: "rear_right_angle",
    label: "Angle arrière droit",
    hint: "Photo de l’angle arrière droit.",
  },
  {
    type: "front_right_angle",
    label: "Angle avant droit",
    hint: "Photo de l’angle avant droit.",
  },
  {
    type: "wheel_front_right",
    label: "Roue avant droite",
    hint: "Photo de la roue avant droite.",
  },
  {
    type: "dashboard",
    label: "Tableau de bord",
    hint: "Photo du tableau de bord avec le kilométrage si possible.",
  },
  {
    type: "front_seat",
    label: "Sièges avant",
    hint: "Photo des sièges avant et de l’état intérieur.",
  },
  {
    type: "rear_seat",
    label: "Sièges arrière",
    hint: "Photo des sièges arrière.",
  },
  {
    type: "trunk",
    label: "Coffre",
    hint: "Photo du coffre.",
  },
];