import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Card } from "@/pages/PecsApp";

// Import PECS images
import momImg from "@/assets/pecs/mom.jpg";
import dadImg from "@/assets/pecs/dad.jpg";
import teacherImg from "@/assets/pecs/teacher.jpg";
import happyImg from "@/assets/pecs/happy.jpg";
import sadImg from "@/assets/pecs/sad.jpg";
import madImg from "@/assets/pecs/mad.jpg";
import tiredImg from "@/assets/pecs/tired.jpg";
import scaredImg from "@/assets/pecs/scared.jpg";
import excitedImg from "@/assets/pecs/excited.jpg";
import calmImg from "@/assets/pecs/calm.jpg";
import eatImg from "@/assets/pecs/eat.jpg";
import drinkImg from "@/assets/pecs/drink.jpg";
import helpImg from "@/assets/pecs/help.jpg";
import stopImg from "@/assets/pecs/stop.jpg";
import moreImg from "@/assets/pecs/more.jpg";
import allDoneImg from "@/assets/pecs/all-done.jpg";
import goImg from "@/assets/pecs/go.jpg";
import comeImg from "@/assets/pecs/come.jpg";
import wantImg from "@/assets/pecs/want.jpg";
import needImg from "@/assets/pecs/need.jpg";
import finishedImg from "@/assets/pecs/finished.jpg";
import yesImg from "@/assets/pecs/yes.jpg";
import noImg from "@/assets/pecs/no.jpg";
import maybeImg from "@/assets/pecs/maybe.jpg";
import playImg from "@/assets/pecs/play.jpg";
import readImg from "@/assets/pecs/read.jpg";
import goOutsideImg from "@/assets/pecs/go-outside.jpg";
import listenToMusicImg from "@/assets/pecs/listen-to-music.jpg";
import drawImg from "@/assets/pecs/draw.jpg";
import buildImg from "@/assets/pecs/build.jpg";
import toyImg from "@/assets/pecs/toy.jpg";
import bookImg from "@/assets/pecs/book.jpg";
import waterImg from "@/assets/pecs/water.jpg";
import foodImg from "@/assets/pecs/food.jpg";
import ballImg from "@/assets/pecs/ball.jpg";
import chairImg from "@/assets/pecs/chair.jpg";
import bedImg from "@/assets/pecs/bed.jpg";
import homeImg from "@/assets/pecs/home.jpg";
import schoolImg from "@/assets/pecs/school.jpg";
import parkImg from "@/assets/pecs/park.jpg";
import storeImg from "@/assets/pecs/store.jpg";
import hiImg from "@/assets/pecs/hi.jpg";
import byeImg from "@/assets/pecs/bye.jpg";
import pleaseImg from "@/assets/pecs/please.jpg";
import thankYouImg from "@/assets/pecs/thank-you.jpg";
import sorryImg from "@/assets/pecs/sorry.jpg";

// Level 2 additional imports
import brotherImg from "@/assets/pecs/brother.jpg";
import sisterImg from "@/assets/pecs/sister.jpg";
import friendImg from "@/assets/pecs/friend.jpg";
import nurseImg from "@/assets/pecs/nurse.jpg";
import sillyImg from "@/assets/pecs/silly.jpg";
import boredImg from "@/assets/pecs/bored.jpg";
import appleImg from "@/assets/pecs/apple.jpg";
import bananaImg from "@/assets/pecs/banana.jpg";
import sandwichImg from "@/assets/pecs/sandwich.jpg";
import milkImg from "@/assets/pecs/milk.jpg";
import juiceImg from "@/assets/pecs/juice.jpg";
import snackImg from "@/assets/pecs/snack.jpg";
import cookieImg from "@/assets/pecs/cookie.jpg";
import crayonImg from "@/assets/pecs/crayon.jpg";
import tableImg from "@/assets/pecs/table.jpg";
import tabletImg from "@/assets/pecs/tablet.jpg";
import shoesImg from "@/assets/pecs/shoes.jpg";
import jacketImg from "@/assets/pecs/jacket.jpg";
import bathroomImg from "@/assets/pecs/bathroom.jpg";
import eatBreakfastImg from "@/assets/pecs/eat-breakfast.jpg";
import eatLunchImg from "@/assets/pecs/eat-lunch.jpg";
import eatDinnerImg from "@/assets/pecs/eat-dinner.jpg";
import brushTeethImg from "@/assets/pecs/brush-teeth.jpg";
import washHandsImg from "@/assets/pecs/wash-hands.jpg";
import sleepImg from "@/assets/pecs/sleep.jpg";
import dontWantImg from "@/assets/pecs/don't-want.jpg";
import likeImg from "@/assets/pecs/like.jpg";
import dontLikeImg from "@/assets/pecs/dont-like.jpg";
import lookImg from "@/assets/pecs/look.jpg";
import listenImg from "@/assets/pecs/listen.jpg";
import sitImg from "@/assets/pecs/sit.jpg";
import standImg from "@/assets/pecs/stand.jpg";
import waitImg from "@/assets/pecs/wait.jpg";
import myTurnImg from "@/assets/pecs/my-turn.jpg";
import yourTurnImg from "@/assets/pecs/your-turn.jpg";
import openImg from "@/assets/pecs/open.jpg";
import closeImg from "@/assets/pecs/close.jpg";
import goodJobImg from "@/assets/pecs/good-job.jpg";
import iLoveYouImg from "@/assets/pecs/i-love-you.jpg";
import whatImg from "@/assets/pecs/what.jpg";
import whereImg from "@/assets/pecs/where.jpg";
import whoImg from "@/assets/pecs/who.jpg";
import whenImg from "@/assets/pecs/when.jpg";
import bigImg from "@/assets/pecs/big.jpg";
import smallImg from "@/assets/pecs/small.jpg";
import hotImg from "@/assets/pecs/hot.jpg";
import coldImg from "@/assets/pecs/cold.jpg";
import quietImg from "@/assets/pecs/quiet.jpg";

// Level 3 additional imports
import grandmaImg from "@/assets/pecs/grandma.jpg";
import grandpaImg from "@/assets/pecs/grandpa.jpg";
import classmateImg from "@/assets/pecs/classmate.jpg";
import doctorImg from "@/assets/pecs/doctor.jpg";
import busDriverImg from "@/assets/pecs/bus-driver.jpg";
import frustratedImg from "@/assets/pecs/frustrated.jpg";
import proudImg from "@/assets/pecs/proud.jpg";
import nervousImg from "@/assets/pecs/nervous.jpg";
import surprisedImg from "@/assets/pecs/surprised.jpg";
import orangeImg from "@/assets/pecs/orange.jpg";
import pizzaImg from "@/assets/pecs/pizza.jpg";
import riceImg from "@/assets/pecs/rice.jpg";
import chickenImg from "@/assets/pecs/chicken.jpg";
import fishImg from "@/assets/pecs/fish.jpg";
import soupImg from "@/assets/pecs/soup.jpg";
import iceCreamImg from "@/assets/pecs/ice-cream.jpg";
import playgroundImg from "@/assets/pecs/playground.jpg";
import kitchenImg from "@/assets/pecs/kitchen.jpg";
import bedroomImg from "@/assets/pecs/bedroom.jpg";
import outsideImg from "@/assets/pecs/outside.jpg";
import insideImg from "@/assets/pecs/inside.jpg";
import backpackImg from "@/assets/pecs/backpack.jpg";
import phoneImg from "@/assets/pecs/phone.jpg";
import computerImg from "@/assets/pecs/computer.jpg";
import hatImg from "@/assets/pecs/hat.jpg";
import pencilImg from "@/assets/pecs/pencil.jpg";
import eraserImg from "@/assets/pecs/eraser.jpg";
import deskImg from "@/assets/pecs/desk.jpg";
import thinkImg from "@/assets/pecs/think.jpg";
import knowImg from "@/assets/pecs/know.jpg";
import seeImg from "@/assets/pecs/see.jpg";
import hearImg from "@/assets/pecs/hear.jpg";
import touchImg from "@/assets/pecs/touch.jpg";
import feelImg from "@/assets/pecs/feel.jpg";
import talkImg from "@/assets/pecs/talk.jpg";
import tellImg from "@/assets/pecs/tell.jpg";
import askImg from "@/assets/pecs/ask.jpg";
import sayImg from "@/assets/pecs/say.jpg";
import giveImg from "@/assets/pecs/give.jpg";
import takeImg from "@/assets/pecs/take.jpg";
import makeImg from "@/assets/pecs/make.jpg";
import findImg from "@/assets/pecs/find.jpg";
import workImg from "@/assets/pecs/work.jpg";
import youreWelcomeImg from "@/assets/pecs/youre-welcome.jpg";
import howAreYouImg from "@/assets/pecs/how-are-you.jpg";
import whatsWrongImg from "@/assets/pecs/whats-wrong.jpg";
import iDontKnowImg from "@/assets/pecs/i-dont-know.jpg";
import canIHaveImg from "@/assets/pecs/can-i-have.jpg";
import iNeedHelpImg from "@/assets/pecs/i-need-help.jpg";
import fastImg from "@/assets/pecs/fast.jpg";
import slowImg from "@/assets/pecs/slow.jpg";
import wetImg from "@/assets/pecs/wet.jpg";
import dryImg from "@/assets/pecs/dry.jpg";
import cleanImg from "@/assets/pecs/clean.jpg";
import dirtyImg from "@/assets/pecs/dirty.jpg";
import loudImg from "@/assets/pecs/loud.jpg";
import upImg from "@/assets/pecs/up.jpg";
import downImg from "@/assets/pecs/down.jpg";
import leftImg from "@/assets/pecs/left.jpg";
import rightImg from "@/assets/pecs/right.jpg";
import todayImg from "@/assets/pecs/today.jpg";
import tomorrowImg from "@/assets/pecs/tomorrow.jpg";
import yesterdayImg from "@/assets/pecs/yesterday.jpg";
import morningImg from "@/assets/pecs/morning.jpg";
import afternoonImg from "@/assets/pecs/afternoon.jpg";
import nightImg from "@/assets/pecs/night.jpg";
import whyImg from "@/assets/pecs/why.jpg";
import howImg from "@/assets/pecs/how.jpg";
import colorImg from "@/assets/pecs/color.jpg";
import singImg from "@/assets/pecs/sing.jpg";
import danceImg from "@/assets/pecs/dance.jpg";
import watchTvImg from "@/assets/pecs/watch-tv.jpg";
import playGameImg from "@/assets/pecs/play-game.jpg";
import rideBikeImg from "@/assets/pecs/ride-bike.jpg";
import goSwimmingImg from "@/assets/pecs/go-swimming.jpg";
import buildBlocksImg from "@/assets/pecs/build-blocks.jpg";

export type VocabularyLevel = 1 | 2 | 3;

interface CardStore {
  cards: Card[];
  sentence: Card[];
  favorites: string[];
  currentLevel: VocabularyLevel;
  addToSentence: (card: Card) => void;
  removeFromSentence: (index: number) => void;
  clearSentence: () => void;
  toggleFavorite: (cardId: string) => void;
  incrementUsage: (cardId: string) => void;
  setLevel: (level: VocabularyLevel) => void;
  getFilteredCards: () => Card[];
}

// Level 1 - Beginner (46 cards)
const level1Cards: Card[] = [
  // People
  { id: "l1-1", text: "Mom", category: "people", usage: 0, level: 1, image: momImg },
  { id: "l1-2", text: "Dad", category: "people", usage: 0, level: 1, image: dadImg },
  { id: "l1-3", text: "Teacher", category: "people", usage: 0, level: 1, image: teacherImg },
  
  // Feelings
  { id: "l1-4", text: "Happy", category: "feelings", usage: 0, level: 1, image: happyImg },
  { id: "l1-5", text: "Sad", category: "feelings", usage: 0, level: 1, image: sadImg },
  { id: "l1-6", text: "Mad", category: "feelings", usage: 0, level: 1, image: madImg },
  { id: "l1-7", text: "Tired", category: "feelings", usage: 0, level: 1, image: tiredImg },
  { id: "l1-8", text: "Scared", category: "feelings", usage: 0, level: 1, image: scaredImg },
  { id: "l1-9", text: "Excited", category: "feelings", usage: 0, level: 1, image: excitedImg },
  { id: "l1-10", text: "Calm", category: "feelings", usage: 0, level: 1, image: calmImg },
  
  // Needs & Actions
  { id: "l1-11", text: "Eat", category: "actions", usage: 0, level: 1, image: eatImg },
  { id: "l1-12", text: "Drink", category: "actions", usage: 0, level: 1, image: drinkImg },
  { id: "l1-13", text: "Help", category: "actions", usage: 0, level: 1, image: helpImg },
  { id: "l1-14", text: "Stop", category: "actions", usage: 0, level: 1, image: stopImg },
  { id: "l1-15", text: "More", category: "actions", usage: 0, level: 1, image: moreImg },
  { id: "l1-16", text: "All done", category: "actions", usage: 0, level: 1, image: allDoneImg },
  { id: "l1-17", text: "Go", category: "actions", usage: 0, level: 1, image: goImg },
  { id: "l1-18", text: "Come", category: "actions", usage: 0, level: 1, image: comeImg },
  { id: "l1-19", text: "Want", category: "actions", usage: 0, level: 1, image: wantImg },
  { id: "l1-20", text: "Need", category: "actions", usage: 0, level: 1, image: needImg },
  { id: "l1-21", text: "Finished", category: "actions", usage: 0, level: 1, image: finishedImg },
  
  // Responses
  { id: "l1-22", text: "Yes", category: "responses", usage: 0, level: 1, image: yesImg },
  { id: "l1-23", text: "No", category: "responses", usage: 0, level: 1, image: noImg },
  { id: "l1-24", text: "Maybe", category: "responses", usage: 0, level: 1, image: maybeImg },
  
  // Activities
  { id: "l1-25", text: "Play", category: "activities", usage: 0, level: 1, image: playImg },
  { id: "l1-26", text: "Read", category: "activities", usage: 0, level: 1, image: readImg },
  { id: "l1-27", text: "Go outside", category: "activities", usage: 0, level: 1, image: goOutsideImg },
  { id: "l1-28", text: "Listen to music", category: "activities", usage: 0, level: 1, image: listenToMusicImg },
  { id: "l1-29", text: "Draw", category: "activities", usage: 0, level: 1, image: drawImg },
  { id: "l1-30", text: "Build", category: "activities", usage: 0, level: 1, image: buildImg },
  
  // Objects/Items
  { id: "l1-31", text: "Toy", category: "objects", usage: 0, level: 1, image: toyImg },
  { id: "l1-32", text: "Book", category: "objects", usage: 0, level: 1, image: bookImg },
  { id: "l1-33", text: "Water", category: "objects", usage: 0, level: 1, image: waterImg },
  { id: "l1-34", text: "Food", category: "objects", usage: 0, level: 1, image: foodImg },
  { id: "l1-35", text: "Ball", category: "objects", usage: 0, level: 1, image: ballImg },
  { id: "l1-36", text: "Chair", category: "objects", usage: 0, level: 1, image: chairImg },
  { id: "l1-37", text: "Bed", category: "objects", usage: 0, level: 1, image: bedImg },
  
  // Places
  { id: "l1-38", text: "Home", category: "places", usage: 0, level: 1, image: homeImg },
  { id: "l1-39", text: "School", category: "places", usage: 0, level: 1, image: schoolImg },
  { id: "l1-40", text: "Park", category: "places", usage: 0, level: 1, image: parkImg },
  { id: "l1-41", text: "Store", category: "places", usage: 0, level: 1, image: storeImg },
  
  // Social
  { id: "l1-42", text: "Hi", category: "social", usage: 0, level: 1, image: hiImg },
  { id: "l1-43", text: "Bye", category: "social", usage: 0, level: 1, image: byeImg },
  { id: "l1-44", text: "Please", category: "social", usage: 0, level: 1, image: pleaseImg },
  { id: "l1-45", text: "Thank you", category: "social", usage: 0, level: 1, image: thankYouImg },
  { id: "l1-46", text: "Sorry", category: "social", usage: 0, level: 1, image: sorryImg },
];

// Level 2 - Intermediate (adds 29 new cards to Level 1's 46 cards)
const level2Cards: Card[] = [
  ...level1Cards,
  { id: "l2-1", text: "Brother", category: "people", usage: 0, level: 2, image: brotherImg },
  { id: "l2-2", text: "Sister", category: "people", usage: 0, level: 2, image: sisterImg },
  { id: "l2-3", text: "Friend", category: "people", usage: 0, level: 2, image: friendImg },
  { id: "l2-4", text: "Nurse", category: "people", usage: 0, level: 2, image: nurseImg },
  { id: "l2-6", text: "Silly", category: "feelings", usage: 0, level: 2, image: sillyImg },
  { id: "l2-7", text: "Bored", category: "feelings", usage: 0, level: 2, image: boredImg },
  { id: "l2-8", text: "Apple", category: "food", usage: 0, level: 2, image: appleImg },
  { id: "l2-9", text: "Banana", category: "food", usage: 0, level: 2, image: bananaImg },
  { id: "l2-10", text: "Sandwich", category: "food", usage: 0, level: 2, image: sandwichImg },
  { id: "l2-11", text: "Milk", category: "food", usage: 0, level: 2, image: milkImg },
  { id: "l2-12", text: "Juice", category: "food", usage: 0, level: 2, image: juiceImg },
  { id: "l2-13", text: "Snack", category: "food", usage: 0, level: 2, image: snackImg },
  { id: "l2-14", text: "Cookie", category: "food", usage: 0, level: 2, image: cookieImg },
  { id: "l2-15", text: "Crayon", category: "objects", usage: 0, level: 2, image: crayonImg },
  { id: "l2-16", text: "Table", category: "objects", usage: 0, level: 2, image: tableImg },
  { id: "l2-17", text: "Tablet", category: "objects", usage: 0, level: 2, image: tabletImg },
  { id: "l2-18", text: "Shoes", category: "objects", usage: 0, level: 2, image: shoesImg },
  { id: "l2-19", text: "Jacket", category: "objects", usage: 0, level: 2, image: jacketImg },
  { id: "l2-20", text: "Bathroom", category: "places", usage: 0, level: 2, image: bathroomImg },
  { id: "l2-21", text: "Eat breakfast", category: "activities", usage: 0, level: 2, image: eatBreakfastImg },
  { id: "l2-22", text: "Eat lunch", category: "activities", usage: 0, level: 2, image: eatLunchImg },
  { id: "l2-23", text: "Eat dinner", category: "activities", usage: 0, level: 2, image: eatDinnerImg },
  { id: "l2-24", text: "Brush teeth", category: "activities", usage: 0, level: 2, image: brushTeethImg },
  { id: "l2-25", text: "Wash hands", category: "activities", usage: 0, level: 2, image: washHandsImg },
  { id: "l2-26", text: "Don't want", category: "actions", usage: 0, level: 2, image: dontWantImg },
  { id: "l2-27", text: "Like", category: "actions", usage: 0, level: 2, image: likeImg },
  { id: "l2-28", text: "Don't like", category: "actions", usage: 0, level: 2, image: dontLikeImg },
  { id: "l2-29", text: "Look", category: "actions", usage: 0, level: 2, image: lookImg },
  { id: "l2-30", text: "Listen", category: "actions", usage: 0, level: 2, image: listenImg },
  { id: "l2-31", text: "Sit", category: "actions", usage: 0, level: 2, image: sitImg },
  { id: "l2-32", text: "Stand", category: "actions", usage: 0, level: 2, image: standImg },
  { id: "l2-33", text: "Wait", category: "actions", usage: 0, level: 2, image: waitImg },
  { id: "l2-34", text: "My turn", category: "social", usage: 0, level: 2, image: myTurnImg },
  { id: "l2-35", text: "Your turn", category: "social", usage: 0, level: 2, image: yourTurnImg },
  { id: "l2-36", text: "Open", category: "actions", usage: 0, level: 2, image: openImg },
  { id: "l2-37", text: "Close", category: "actions", usage: 0, level: 2, image: closeImg },
  { id: "l2-38", text: "Good job", category: "social", usage: 0, level: 2, image: goodJobImg },
  { id: "l2-39", text: "I love you", category: "social", usage: 0, level: 2, image: iLoveYouImg },
  { id: "l2-40", text: "What?", category: "social", usage: 0, level: 2, image: whatImg },
  { id: "l2-41", text: "Where?", category: "social", usage: 0, level: 2, image: whereImg },
  { id: "l2-42", text: "Who?", category: "social", usage: 0, level: 2, image: whoImg },
  { id: "l2-43", text: "When?", category: "social", usage: 0, level: 2, image: whenImg },
  { id: "l2-44", text: "Big", category: "descriptive", usage: 0, level: 2, image: bigImg },
  { id: "l2-45", text: "Small", category: "descriptive", usage: 0, level: 2, image: smallImg },
  { id: "l2-46", text: "Hot", category: "descriptive", usage: 0, level: 2, image: hotImg },
  { id: "l2-47", text: "Cold", category: "descriptive", usage: 0, level: 2, image: coldImg },
  { id: "l2-48", text: "Quiet", category: "descriptive", usage: 0, level: 2, image: quietImg },
];

// Level 3 - Advanced (adds 75 new cards to Level 2's 75 cards)
const level3Cards: Card[] = [
  ...level2Cards,
  { id: "l3-1", text: "Grandma", category: "people", usage: 0, level: 3, image: grandmaImg },
  { id: "l3-2", text: "Grandpa", category: "people", usage: 0, level: 3, image: grandpaImg },
  { id: "l3-3", text: "Classmate", category: "people", usage: 0, level: 3, image: classmateImg },
  { id: "l3-4", text: "Doctor", category: "people", usage: 0, level: 3, image: doctorImg },
  { id: "l3-5", text: "Bus driver", category: "people", usage: 0, level: 3, image: busDriverImg },
  { id: "l3-6", text: "Frustrated", category: "feelings", usage: 0, level: 3, image: frustratedImg },
  { id: "l3-7", text: "Proud", category: "feelings", usage: 0, level: 3, image: proudImg },
  { id: "l3-8", text: "Nervous", category: "feelings", usage: 0, level: 3, image: nervousImg },
  { id: "l3-9", text: "Surprised", category: "feelings", usage: 0, level: 3, image: surprisedImg },
  { id: "l3-11", text: "Orange", category: "food", usage: 0, level: 3, image: orangeImg },
  { id: "l3-12", text: "Pizza", category: "food", usage: 0, level: 3, image: pizzaImg },
  { id: "l3-13", text: "Rice", category: "food", usage: 0, level: 3, image: riceImg },
  { id: "l3-14", text: "Chicken", category: "food", usage: 0, level: 3, image: chickenImg },
  { id: "l3-15", text: "Fish", category: "food", usage: 0, level: 3, image: fishImg },
  { id: "l3-16", text: "Soup", category: "food", usage: 0, level: 3, image: soupImg },
  { id: "l3-17", text: "Ice cream", category: "food", usage: 0, level: 3, image: iceCreamImg },
  { id: "l3-18", text: "Playground", category: "places", usage: 0, level: 3, image: playgroundImg },
  { id: "l3-19", text: "Kitchen", category: "places", usage: 0, level: 3, image: kitchenImg },
  { id: "l3-20", text: "Bedroom", category: "places", usage: 0, level: 3, image: bedroomImg },
  { id: "l3-21", text: "Outside", category: "places", usage: 0, level: 3, image: outsideImg },
  { id: "l3-22", text: "Inside", category: "places", usage: 0, level: 3, image: insideImg },
  { id: "l3-23", text: "Backpack", category: "objects", usage: 0, level: 3, image: backpackImg },
  { id: "l3-24", text: "Phone", category: "objects", usage: 0, level: 3, image: phoneImg },
  { id: "l3-25", text: "Computer", category: "objects", usage: 0, level: 3, image: computerImg },
  { id: "l3-26", text: "Hat", category: "objects", usage: 0, level: 3, image: hatImg },
  { id: "l3-27", text: "Pencil", category: "objects", usage: 0, level: 3, image: pencilImg },
  { id: "l3-28", text: "Eraser", category: "objects", usage: 0, level: 3, image: eraserImg },
  { id: "l3-29", text: "Desk", category: "objects", usage: 0, level: 3, image: deskImg },
  { id: "l3-30", text: "Think", category: "actions", usage: 0, level: 3, image: thinkImg },
  { id: "l3-31", text: "Know", category: "actions", usage: 0, level: 3, image: knowImg },
  { id: "l3-32", text: "See", category: "actions", usage: 0, level: 3, image: seeImg },
  { id: "l3-33", text: "Hear", category: "actions", usage: 0, level: 3, image: hearImg },
  { id: "l3-34", text: "Touch", category: "actions", usage: 0, level: 3, image: touchImg },
  { id: "l3-35", text: "Feel", category: "actions", usage: 0, level: 3, image: feelImg },
  { id: "l3-36", text: "Talk", category: "actions", usage: 0, level: 3, image: talkImg },
  { id: "l3-37", text: "Tell", category: "actions", usage: 0, level: 3, image: tellImg },
  { id: "l3-38", text: "Ask", category: "actions", usage: 0, level: 3, image: askImg },
  { id: "l3-39", text: "Say", category: "actions", usage: 0, level: 3, image: sayImg },
  { id: "l3-40", text: "Give", category: "actions", usage: 0, level: 3, image: giveImg },
  { id: "l3-41", text: "Take", category: "actions", usage: 0, level: 3, image: takeImg },
  { id: "l3-42", text: "Make", category: "actions", usage: 0, level: 3, image: makeImg },
  { id: "l3-43", text: "Find", category: "actions", usage: 0, level: 3, image: findImg },
  { id: "l3-44", text: "Work", category: "actions", usage: 0, level: 3, image: workImg },
  { id: "l3-47", text: "You're welcome", category: "social", usage: 0, level: 3, image: youreWelcomeImg },
  { id: "l3-48", text: "How are you?", category: "social", usage: 0, level: 3, image: howAreYouImg },
  { id: "l3-49", text: "What's wrong?", category: "social", usage: 0, level: 3, image: whatsWrongImg },
  { id: "l3-50", text: "I don't know", category: "social", usage: 0, level: 3, image: iDontKnowImg },
  { id: "l3-51", text: "Can I have?", category: "social", usage: 0, level: 3, image: canIHaveImg },
  { id: "l3-52", text: "I need help", category: "social", usage: 0, level: 3, image: iNeedHelpImg },
  { id: "l3-53", text: "Fast", category: "descriptive", usage: 0, level: 3, image: fastImg },
  { id: "l3-54", text: "Slow", category: "descriptive", usage: 0, level: 3, image: slowImg },
  { id: "l3-55", text: "Wet", category: "descriptive", usage: 0, level: 3, image: wetImg },
  { id: "l3-56", text: "Dry", category: "descriptive", usage: 0, level: 3, image: dryImg },
  { id: "l3-57", text: "Clean", category: "descriptive", usage: 0, level: 3, image: cleanImg },
  { id: "l3-58", text: "Dirty", category: "descriptive", usage: 0, level: 3, image: dirtyImg },
  { id: "l3-59", text: "Loud", category: "descriptive", usage: 0, level: 3, image: loudImg },
  { id: "l3-60", text: "Up", category: "descriptive", usage: 0, level: 3, image: upImg },
  { id: "l3-61", text: "Down", category: "descriptive", usage: 0, level: 3, image: downImg },
  { id: "l3-62", text: "Left", category: "descriptive", usage: 0, level: 3, image: leftImg },
  { id: "l3-63", text: "Right", category: "descriptive", usage: 0, level: 3, image: rightImg },
  { id: "l3-64", text: "Today", category: "time", usage: 0, level: 3, image: todayImg },
  { id: "l3-65", text: "Tomorrow", category: "time", usage: 0, level: 3, image: tomorrowImg },
  { id: "l3-66", text: "Yesterday", category: "time", usage: 0, level: 3, image: yesterdayImg },
  { id: "l3-67", text: "Morning", category: "time", usage: 0, level: 3, image: morningImg },
  { id: "l3-68", text: "Afternoon", category: "time", usage: 0, level: 3, image: afternoonImg },
  { id: "l3-69", text: "Night", category: "time", usage: 0, level: 3, image: nightImg },
  { id: "l3-70", text: "Why?", category: "social", usage: 0, level: 3, image: whyImg },
  { id: "l3-71", text: "How?", category: "social", usage: 0, level: 3, image: howImg },
  { id: "l3-72", text: "Color", category: "activities", usage: 0, level: 3, image: colorImg },
  { id: "l3-73", text: "Sing", category: "activities", usage: 0, level: 3, image: singImg },
  { id: "l3-74", text: "Dance", category: "activities", usage: 0, level: 3, image: danceImg },
  { id: "l3-75", text: "Watch TV", category: "activities", usage: 0, level: 3, image: watchTvImg },
];

const allCards = level3Cards;

export const useCardStore = create<CardStore>()(
  persist(
    (set, get) => ({
      cards: allCards,
      sentence: [],
      favorites: [],
      currentLevel: 1,
      
      addToSentence: (card) =>
        set((state) => ({
          sentence: [...state.sentence, card],
        })),
      
      removeFromSentence: (index) =>
        set((state) => ({
          sentence: state.sentence.filter((_, i) => i !== index),
        })),
      
      clearSentence: () => set({ sentence: [] }),
      
      toggleFavorite: (cardId) =>
        set((state) => ({
          favorites: state.favorites.includes(cardId)
            ? state.favorites.filter((id) => id !== cardId)
            : [...state.favorites, cardId],
        })),
      
      incrementUsage: (cardId) =>
        set((state) => ({
          cards: state.cards.map((card) =>
            card.id === cardId ? { ...card, usage: card.usage + 1 } : card
          ),
        })),
      
      setLevel: (level) => set({ currentLevel: level }),
      
      getFilteredCards: () => {
        const state = get();
        return state.cards.filter(card => (card.level || 1) <= state.currentLevel);
      },
    }),
    {
      name: "pecs-storage",
      version: 5, // Fixed duplicates and capitalization
      migrate: (persistedState: any, version: number) => {
        if (version < 5) {
          // Force reload with fixed cards (removed duplicates, fixed capitalization)
          return {
            ...persistedState,
            cards: allCards,
          };
        }
        return persistedState;
      },
    }
  )
);
