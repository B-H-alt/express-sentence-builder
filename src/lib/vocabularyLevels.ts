// Minimum vocabulary access, not a judgment of the learner's ability.
// Legacy IDs stay unchanged because images, favorites, and history use them.
export const auditedMinimumLevels: Readonly<Record<string, 1 | 2 | 3>> = {
  // Level 1: first-person expression, refusal, basic comfort, and urgent needs.
  "pronoun-i": 1, "pronoun-you": 1,
  "l2-13": 1, // Snack
  "l2-20": 1, // Bathroom
  "l2-26": 1, "l2-27": 1, "l2-28": 1, // Don't want, Like, Don't like
  "l2-33": 1, // Wait
  "l2-46": 1, "l2-47": 1, "l2-48": 1, // Hot, Cold, Quiet
  "l2-61": 1, // Stomach: reporting where something is wrong
  "l3-35": 1, // Feel
  "l3-52": 1, // I need help
  "l3-59": 1, // Loud

  // Level 2: daily life, family, common actions, body locations, and routines.
  "l2-57": 2, "l2-58": 2, "l2-59": 2, "l2-60": 2,
  "l2-62": 2, "l2-63": 2, "l2-64": 2, // Cut, Nails, Teeth, Arm, Toe, Finger, Leg
  "l3-1": 2, "l3-2": 2, "l3-4": 2, // Grandma, Grandpa, Doctor
  "l3-6": 2, "l3-8": 2, // Frustrated, Nervous
  "l3-11": 2, "l3-12": 2, "l3-13": 2, "l3-14": 2,
  "l3-15": 2, "l3-16": 2, "l3-17": 2, // Everyday food choices
  "l3-19": 2, "l3-20": 2, "l3-21": 2, "l3-22": 2, // Kitchen, Bedroom, Outside, Inside
  "l3-32": 2, "l3-33": 2, "l3-34": 2, "l3-36": 2, // See, Hear, Touch, Talk
  "l3-38": 2, "l3-39": 2, // Ask, Say
  "l3-40": 2, "l3-41": 2,
  "l3-42": 2, "l3-43": 2, // Give, Take, Make, Find
  "l3-50": 2, // I don't know: a communication repair response
  "l3-53": 2, "l3-54": 2, "l3-55": 2, "l3-56": 2,
  "l3-57": 2, "l3-58": 2, "l3-60": 2, "l3-61": 2, // Describing everyday experiences
  "l3-80": 2, "l3-81": 2, // Now, Later
  "l3-72": 2, "l3-73": 2, "l3-74": 2, // Color, Sing, Dance
};
