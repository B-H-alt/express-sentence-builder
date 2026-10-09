import type { AppLanguage, CharacterGender } from "@/store/cardStore";

const spanishCardLabels: Record<string, string> = {
  "Afternoon": "Tarde", "All done": "Terminé", "Apple": "Manzana", "Arm": "Brazo",
  "Ask": "Preguntar", "Backpack": "Mochila", "Ball": "Pelota", "Banana": "Banana",
  "Bathroom": "Baño", "Bed": "Cama", "Bedroom": "Dormitorio", "Big": "Grande",
  "Blow": "Soplar", "Book": "Libro", "Bored": "Aburrido", "Brother": "Hermano",
  "Brush": "Cepillar", "Brush teeth": "Cepillarse los dientes", "Bubbles": "Burbujas",
  "Build": "Construir", "Build blocks": "Construir con bloques", "Bus driver": "Conductor de autobús",
  "Bye": "Adiós", "Calm": "Tranquilo", "Can I have?": "¿Me das?", "Chair": "Silla",
  "Chicken": "Pollo", "Classmate": "Compañero de clase", "Clean": "Limpio", "Close": "Cerrar",
  "Clothes": "Ropa", "Cold": "Frío", "Color": "Colorear", "Come": "Venir",
  "Computer": "Computadora", "Cookie": "Galleta", "Crayon": "Crayón", "Cut": "Cortar",
  "Dad": "Papá", "Dance": "Bailar", "Desk": "Escritorio", "Dirty": "Sucio",
  "Doctor": "Doctor", "Don't like": "No me gusta", "Don't want": "No quiero", "Down": "Abajo",
  "Draw": "Dibujar", "Drink": "Beber", "Dry": "Seco", "Eat": "Comer",
  "Eat breakfast": "Desayunar", "Eat dinner": "Cenar", "Eat lunch": "Almorzar",
  "Eraser": "Borrador", "Excited": "Emocionado", "Fast": "Rápido", "Feel": "Sentir",
  "Find": "Encontrar", "Finger": "Dedo", "Finished": "Terminado", "Fish": "Pescado",
  "Floss": "Usar hilo dental", "Food": "Comida", "Foot": "Pie", "Friend": "Amigo",
  "Frustrated": "Frustrado", "Give": "Dar", "Go": "Ir", "Go outside": "Salir",
  "Go swimming": "Ir a nadar", "Good job": "Buen trabajo", "Grandma": "Abuela",
  "Grandpa": "Abuelo", "Hair": "Cabello", "Hand": "Mano", "Happy": "Feliz",
  "Hat": "Sombrero", "He": "Él", "Head": "Cabeza", "Hear": "Oír", "Help": "Ayuda",
  "Hi": "Hola", "Home": "Casa", "Hot": "Caliente", "How are you?": "¿Cómo estás?",
  "How?": "¿Cómo?", "I": "Yo", "I don't know": "No sé", "I love you": "Te quiero",
  "I need help": "Necesito ayuda", "Ice cream": "Helado", "Inside": "Adentro",
  "Jacket": "Chaqueta", "Juice": "Jugo", "Kitchen": "Cocina", "Know": "Saber",
  "Later": "Después", "Left": "Izquierda", "Leg": "Pierna", "Like": "Me gusta",
  "Listen": "Escuchar", "Listen to music": "Escuchar música", "Look": "Mirar", "Loud": "Fuerte",
  "Mad": "Enojado", "Make": "Hacer", "Make Bed": "Hacer la cama", "Maybe": "Tal vez",
  "Milk": "Leche", "Mom": "Mamá", "More": "Más", "Morning": "Mañana",
  "My turn": "Mi turno", "Nails": "Uñas", "Need": "Necesito", "Nervous": "Nervioso",
  "Night": "Noche", "No": "No", "Nose": "Nariz", "Now": "Ahora", "Nurse": "Enfermero",
  "Open": "Abrir", "Orange": "Naranja", "Outside": "Afuera", "Park": "Parque",
  "Pencil": "Lápiz", "Phone": "Teléfono", "Pizza": "Pizza", "Play": "Jugar",
  "Play game": "Jugar un juego", "Playground": "Área de juegos", "Please": "Por favor",
  "Proud": "Orgulloso", "Put Away": "Guardar", "Quiet": "Silencioso", "Read": "Leer",
  "Rice": "Arroz", "Ride bike": "Montar bicicleta", "Right": "Derecha", "Sad": "Triste",
  "Sandwich": "Sándwich", "Say": "Decir", "Scared": "Asustado", "School": "Escuela",
  "See": "Ver", "She": "Ella", "Shoes": "Zapatos", "Shower": "Ducharse", "Silly": "Juguetón",
  "Sing": "Cantar", "Sister": "Hermana", "Sit": "Sentarse", "Slow": "Lento",
  "Small": "Pequeño", "Snack": "Merienda", "Sorry": "Lo siento", "Soup": "Sopa",
  "Stand": "Pararse", "Stomach": "Estómago", "Stop": "Alto", "Store": "Tienda",
  "Surprised": "Sorprendido", "Table": "Mesa", "Tablet": "Tableta", "Take": "Tomar",
  "Talk": "Hablar", "Teacher": "Maestro", "Teeth": "Dientes", "Tell": "Contar",
  "Thank you": "Gracias", "Think": "Pensar", "Tired": "Cansado", "Today": "Hoy",
  "Toe": "Dedo del pie", "Tomorrow": "Mañana", "Touch": "Tocar", "Toy": "Juguete",
  "Up": "Arriba", "Wait": "Esperar", "Want": "Quiero", "Wash hands": "Lavarse las manos",
  "Watch TV": "Ver televisión", "Water": "Agua", "Wet": "Mojado",
  "What's wrong?": "¿Qué pasa?", "What?": "¿Qué?", "When?": "¿Cuándo?",
  "Where?": "¿Dónde?", "Who?": "¿Quién?", "Why?": "¿Por qué?", "Work": "Trabajar",
  "Yes": "Sí", "Yesterday": "Ayer", "You": "Tú", "You're welcome": "De nada",
  "Your turn": "Tu turno",
};

const spanishFeminineLabels: Record<string, string> = {
  Bored: "Aburrida", Calm: "Tranquila", Excited: "Emocionada", Frustrated: "Frustrada",
  Mad: "Enojada", Nervous: "Nerviosa", Proud: "Orgullosa", Scared: "Asustada",
  Silly: "Juguetona", Surprised: "Sorprendida", Tired: "Cansada",
};

export const translateCardLabel = (
  label: string,
  language: AppLanguage,
  characterGender?: CharacterGender,
) => {
  if (language !== "es") return label;
  if (characterGender === "girl" && spanishFeminineLabels[label]) return spanishFeminineLabels[label];
  return spanishCardLabels[label] ?? label;
};

export const languageNames: Record<AppLanguage, string> = {
  en: "English",
  es: "Español",
};

const spanishCategories: Record<string, string> = {
  people: "Personas", body: "Cuerpo", feelings: "Sentimientos", actions: "Necesidades y acciones",
  responses: "Respuestas", activities: "Actividades", objects: "Objetos", places: "Lugares",
  social: "Social", food: "Comida", descriptive: "Descripciones", time: "Tiempo",
  all: "Todas las tarjetas", favorites: "Favoritos", home: "Inicio",
};

export const translateCategory = (category: string, language: AppLanguage) =>
  language === "es" ? spanishCategories[category] ?? category : category;

export const appText = {
  en: {
    mySentence: "My Sentence", howToUse: "How to use Expressly", howItWorks: "How it works",
    tense: "Tense", past: "Past", present: "Present", future: "Future", finish: "Finish sentence",
    finishShort: "Finish", speak: "Speak", stop: "Stop", startSentence: "Start sentence",
    sentenceHint: "Tap or drag cards here to build your sentence", sentence: "Sentence",
    originalCards: "Original cards", grammarSignIn: "Sign in or create an account to use grammar correction.",
    grammarConfirmEmail: "Confirm your email to use grammar correction.",
    grammarRateLimit: "You’ve corrected several sentences. Please wait a moment and try again.",
    grammarUnavailable: "We couldn’t correct this sentence right now. Please try again.",
    speakNow: "Speak now", search: "Find a card", home: "Home", favorites: "Favorites",
  },
  es: {
    mySentence: "Mi frase", howToUse: "Cómo usar Expressly", howItWorks: "Cómo funciona",
    tense: "Tiempo", past: "Pasado", present: "Presente", future: "Futuro", finish: "Terminar frase",
    finishShort: "Terminar", speak: "Hablar", stop: "Alto", startSentence: "Empezar frase",
    sentenceHint: "Toca o arrastra tarjetas aquí para formar tu frase", sentence: "Frase",
    originalCards: "Tarjetas originales", grammarSignIn: "Inicia sesión o crea una cuenta para usar la corrección gramatical.",
    grammarConfirmEmail: "Confirma tu correo electrónico para usar la corrección gramatical.",
    grammarRateLimit: "Has corregido varias frases. Espera un momento e inténtalo de nuevo.",
    grammarUnavailable: "No pudimos corregir esta frase ahora. Inténtalo de nuevo.",
    speakNow: "Hablar ahora", search: "Buscar una tarjeta", home: "Inicio", favorites: "Favoritos",
  },
} as const;
