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
import helperImg from "@/assets/pecs/helper.jpg";
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
import dontWantImg from "@/assets/pecs/dont-want.jpg";
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
import angryImg from "@/assets/pecs/angry.jpg";
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
import washImg from "@/assets/pecs/wash.jpg";
import brushImg from "@/assets/pecs/brush.jpg";
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

// Level 2 - Intermediate (75 cards)
const level2Cards: Card[] = [
  ...level1Cards,
  { id: "l2-1", text: "brother", category: "people", usage: 0, level: 2, image: brotherImg },
  { id: "l2-2", text: "sister", category: "people", usage: 0, level: 2, image: sisterImg },
  { id: "l2-3", text: "friend", category: "people", usage: 0, level: 2, image: friendImg },
  { id: "l2-4", text: "nurse", category: "people", usage: 0, level: 2, image: nurseImg },
  { id: "l2-5", text: "helper", category: "people", usage: 0, level: 2, image: helperImg },
  { id: "l2-6", text: "excited", category: "feelings", usage: 0, level: 2, image: excitedImg },
  { id: "l2-7", text: "scared", category: "feelings", usage: 0, level: 2, image: scaredImg },
  { id: "l2-8", text: "silly", category: "feelings", usage: 0, level: 2, image: sillyImg },
  { id: "l2-9", text: "bored", category: "feelings", usage: 0, level: 2, image: boredImg },
  { id: "l2-10", text: "calm", category: "feelings", usage: 0, level: 2, image: calmImg },
  { id: "l2-11", text: "apple", category: "food", usage: 0, level: 2, image: appleImg },
  { id: "l2-12", text: "banana", category: "food", usage: 0, level: 2, image: bananaImg },
  { id: "l2-13", text: "sandwich", category: "food", usage: 0, level: 2, image: sandwichImg },
  { id: "l2-14", text: "milk", category: "food", usage: 0, level: 2, image: milkImg },
  { id: "l2-15", text: "juice", category: "food", usage: 0, level: 2, image: juiceImg },
  { id: "l2-16", text: "snack", category: "food", usage: 0, level: 2, image: snackImg },
  { id: "l2-17", text: "cookie", category: "food", usage: 0, level: 2, image: cookieImg },
  { id: "l2-18", text: "ball", category: "objects", usage: 0, level: 2, image: ballImg },
  { id: "l2-19", text: "crayon", category: "objects", usage: 0, level: 2, image: crayonImg },
  { id: "l2-20", text: "chair", category: "objects", usage: 0, level: 2, image: chairImg },
  { id: "l2-21", text: "table", category: "objects", usage: 0, level: 2, image: tableImg },
  { id: "l2-22", text: "tablet", category: "objects", usage: 0, level: 2, image: tabletImg },
  { id: "l2-23", text: "shoes", category: "objects", usage: 0, level: 2, image: shoesImg },
  { id: "l2-24", text: "jacket", category: "objects", usage: 0, level: 2, image: jacketImg },
  { id: "l2-25", text: "school", category: "places", usage: 0, level: 2, image: schoolImg },
  { id: "l2-26", text: "home", category: "places", usage: 0, level: 2, image: homeImg },
  { id: "l2-27", text: "park", category: "places", usage: 0, level: 2, image: parkImg },
  { id: "l2-28", text: "bathroom", category: "places", usage: 0, level: 2, image: bathroomImg },
  { id: "l2-29", text: "eat breakfast", category: "places", usage: 0, level: 2, image: eatBreakfastImg },
  { id: "l2-30", text: "eat lunch", category: "places", usage: 0, level: 2, image: eatLunchImg },
  { id: "l2-31", text: "eat dinner", category: "places", usage: 0, level: 2, image: eatDinnerImg },
  { id: "l2-32", text: "brush teeth", category: "places", usage: 0, level: 2, image: brushTeethImg },
  { id: "l2-33", text: "wash hands", category: "places", usage: 0, level: 2, image: washHandsImg },
  { id: "l2-34", text: "sleep", category: "places", usage: 0, level: 2, image: sleepImg },
  { id: "l2-35", text: "want", category: "actions", usage: 0, level: 2, image: wantImg },
  { id: "l2-36", text: "don't want", category: "actions", usage: 0, level: 2, image: dontWantImg },
  { id: "l2-37", text: "need", category: "actions", usage: 0, level: 2, image: needImg },
  { id: "l2-38", text: "like", category: "actions", usage: 0, level: 2, image: likeImg },
  { id: "l2-39", text: "don't like", category: "actions", usage: 0, level: 2, image: dontLikeImg },
  { id: "l2-40", text: "look", category: "actions", usage: 0, level: 2, image: lookImg },
  { id: "l2-41", text: "listen", category: "actions", usage: 0, level: 2, image: listenImg },
  { id: "l2-42", text: "sit", category: "actions", usage: 0, level: 2, image: sitImg },
  { id: "l2-43", text: "stand", category: "actions", usage: 0, level: 2, image: standImg },
  { id: "l2-44", text: "come", category: "actions", usage: 0, level: 2, image: comeImg },
  { id: "l2-45", text: "go", category: "actions", usage: 0, level: 2, image: goImg },
  { id: "l2-46", text: "wait", category: "actions", usage: 0, level: 2, image: waitImg },
  { id: "l2-47", text: "my turn", category: "actions", usage: 0, level: 2, image: myTurnImg },
  { id: "l2-48", text: "your turn", category: "actions", usage: 0, level: 2, image: yourTurnImg },
  { id: "l2-49", text: "open", category: "actions", usage: 0, level: 2, image: openImg },
  { id: "l2-50", text: "close", category: "actions", usage: 0, level: 2, image: closeImg },
  { id: "l2-51", text: "please", category: "social", usage: 0, level: 2, image: pleaseImg },
  { id: "l2-52", text: "thank you", category: "social", usage: 0, level: 2, image: thankYouImg },
  { id: "l2-53", text: "sorry", category: "social", usage: 0, level: 2, image: sorryImg },
  { id: "l2-54", text: "good job", category: "social", usage: 0, level: 2, image: goodJobImg },
  { id: "l2-55", text: "I love you", category: "social", usage: 0, level: 2, image: iLoveYouImg },
  { id: "l2-56", text: "what?", category: "social", usage: 0, level: 2, image: whatImg },
  { id: "l2-57", text: "where?", category: "social", usage: 0, level: 2, image: whereImg },
  { id: "l2-58", text: "who?", category: "social", usage: 0, level: 2, image: whoImg },
  { id: "l2-59", text: "when?", category: "social", usage: 0, level: 2, image: whenImg },
  { id: "l2-60", text: "big", category: "descriptive", usage: 0, level: 2, image: bigImg },
  { id: "l2-61", text: "small", category: "descriptive", usage: 0, level: 2, image: smallImg },
  { id: "l2-62", text: "hot", category: "descriptive", usage: 0, level: 2, image: hotImg },
  { id: "l2-63", text: "cold", category: "descriptive", usage: 0, level: 2, image: coldImg },
  { id: "l2-64", text: "quiet", category: "descriptive", usage: 0, level: 2, image: quietImg },
];

// Level 3 - Advanced (150 cards)
const level3Cards: Card[] = [
  ...level2Cards,
  { id: "l3-1", text: "grandma", category: "people", usage: 0, level: 3, image: grandmaImg },
  { id: "l3-2", text: "grandpa", category: "people", usage: 0, level: 3, image: grandpaImg },
  { id: "l3-3", text: "classmate", category: "people", usage: 0, level: 3, image: classmateImg },
  { id: "l3-4", text: "doctor", category: "people", usage: 0, level: 3, image: doctorImg },
  { id: "l3-5", text: "bus driver", category: "people", usage: 0, level: 3, image: busDriverImg },
  { id: "l3-6", text: "frustrated", category: "feelings", usage: 0, level: 3, image: frustratedImg },
  { id: "l3-7", text: "proud", category: "feelings", usage: 0, level: 3, image: proudImg },
  { id: "l3-8", text: "nervous", category: "feelings", usage: 0, level: 3, image: nervousImg },
  { id: "l3-9", text: "surprised", category: "feelings", usage: 0, level: 3, image: surprisedImg },
  { id: "l3-10", text: "angry", category: "feelings", usage: 0, level: 3, image: angryImg },
  { id: "l3-11", text: "orange", category: "food", usage: 0, level: 3, image: orangeImg },
  { id: "l3-12", text: "pizza", category: "food", usage: 0, level: 3, image: pizzaImg },
  { id: "l3-13", text: "rice", category: "food", usage: 0, level: 3, image: riceImg },
  { id: "l3-14", text: "chicken", category: "food", usage: 0, level: 3, image: chickenImg },
  { id: "l3-15", text: "fish", category: "food", usage: 0, level: 3, image: fishImg },
  { id: "l3-16", text: "soup", category: "food", usage: 0, level: 3, image: soupImg },
  { id: "l3-17", text: "ice cream", category: "food", usage: 0, level: 3, image: iceCreamImg },
  { id: "l3-18", text: "playground", category: "places", usage: 0, level: 3, image: playgroundImg },
  { id: "l3-19", text: "store", category: "places", usage: 0, level: 3, image: storeImg },
  { id: "l3-20", text: "kitchen", category: "places", usage: 0, level: 3, image: kitchenImg },
  { id: "l3-21", text: "bedroom", category: "places", usage: 0, level: 3, image: bedroomImg },
  { id: "l3-22", text: "outside", category: "places", usage: 0, level: 3, image: outsideImg },
  { id: "l3-23", text: "inside", category: "places", usage: 0, level: 3, image: insideImg },
  { id: "l3-24", text: "backpack", category: "objects", usage: 0, level: 3, image: backpackImg },
  { id: "l3-25", text: "phone", category: "objects", usage: 0, level: 3, image: phoneImg },
  { id: "l3-26", text: "computer", category: "objects", usage: 0, level: 3, image: computerImg },
  { id: "l3-27", text: "hat", category: "objects", usage: 0, level: 3, image: hatImg },
  { id: "l3-28", text: "pencil", category: "objects", usage: 0, level: 3, image: pencilImg },
  { id: "l3-29", text: "eraser", category: "objects", usage: 0, level: 3, image: eraserImg },
  { id: "l3-30", text: "desk", category: "objects", usage: 0, level: 3, image: deskImg },
  { id: "l3-31", text: "think", category: "actions", usage: 0, level: 3, image: thinkImg },
  { id: "l3-32", text: "know", category: "actions", usage: 0, level: 3, image: knowImg },
  { id: "l3-33", text: "see", category: "actions", usage: 0, level: 3, image: seeImg },
  { id: "l3-34", text: "hear", category: "actions", usage: 0, level: 3, image: hearImg },
  { id: "l3-35", text: "touch", category: "actions", usage: 0, level: 3, image: touchImg },
  { id: "l3-36", text: "feel", category: "actions", usage: 0, level: 3, image: feelImg },
  { id: "l3-37", text: "talk", category: "actions", usage: 0, level: 3, image: talkImg },
  { id: "l3-38", text: "tell", category: "actions", usage: 0, level: 3, image: tellImg },
  { id: "l3-39", text: "ask", category: "actions", usage: 0, level: 3, image: askImg },
  { id: "l3-40", text: "say", category: "actions", usage: 0, level: 3, image: sayImg },
  { id: "l3-41", text: "give", category: "actions", usage: 0, level: 3, image: giveImg },
  { id: "l3-42", text: "take", category: "actions", usage: 0, level: 3, image: takeImg },
  { id: "l3-43", text: "make", category: "actions", usage: 0, level: 3, image: makeImg },
  { id: "l3-44", text: "find", category: "actions", usage: 0, level: 3, image: findImg },
  { id: "l3-45", text: "work", category: "actions", usage: 0, level: 3, image: workImg },
  { id: "l3-46", text: "wash", category: "actions", usage: 0, level: 3, image: washImg },
  { id: "l3-47", text: "brush", category: "actions", usage: 0, level: 3, image: brushImg },
  { id: "l3-48", text: "you're welcome", category: "social", usage: 0, level: 3, image: youreWelcomeImg },
  { id: "l3-49", text: "how are you?", category: "social", usage: 0, level: 3, image: howAreYouImg },
  { id: "l3-50", text: "what's wrong?", category: "social", usage: 0, level: 3, image: whatsWrongImg },
  { id: "l3-51", text: "I don't know", category: "social", usage: 0, level: 3, image: iDontKnowImg },
  { id: "l3-52", text: "can I have?", category: "social", usage: 0, level: 3, image: canIHaveImg },
  { id: "l3-53", text: "I need help", category: "social", usage: 0, level: 3, image: iNeedHelpImg },
  { id: "l3-54", text: "fast", category: "descriptive", usage: 0, level: 3, image: fastImg },
  { id: "l3-55", text: "slow", category: "descriptive", usage: 0, level: 3, image: slowImg },
  { id: "l3-56", text: "wet", category: "descriptive", usage: 0, level: 3, image: wetImg },
  { id: "l3-57", text: "dry", category: "descriptive", usage: 0, level: 3, image: dryImg },
  { id: "l3-58", text: "clean", category: "descriptive", usage: 0, level: 3, image: cleanImg },
  { id: "l3-59", text: "dirty", category: "descriptive", usage: 0, level: 3, image: dirtyImg },
  { id: "l3-60", text: "loud", category: "descriptive", usage: 0, level: 3, image: loudImg },
  { id: "l3-61", text: "up", category: "descriptive", usage: 0, level: 3, image: upImg },
  { id: "l3-62", text: "down", category: "descriptive", usage: 0, level: 3, image: downImg },
  { id: "l3-63", text: "left", category: "descriptive", usage: 0, level: 3, image: leftImg },
  { id: "l3-64", text: "right", category: "descriptive", usage: 0, level: 3, image: rightImg },
  { id: "l3-65", text: "today", category: "time", usage: 0, level: 3, image: todayImg },
  { id: "l3-66", text: "tomorrow", category: "time", usage: 0, level: 3, image: tomorrowImg },
  { id: "l3-67", text: "yesterday", category: "time", usage: 0, level: 3, image: yesterdayImg },
  { id: "l3-68", text: "morning", category: "time", usage: 0, level: 3, image: morningImg },
  { id: "l3-69", text: "afternoon", category: "time", usage: 0, level: 3, image: afternoonImg },
  { id: "l3-70", text: "night", category: "time", usage: 0, level: 3, image: nightImg },
  { id: "l3-71", text: "why?", category: "time", usage: 0, level: 3, image: whyImg },
  { id: "l3-72", text: "how?", category: "time", usage: 0, level: 3, image: howImg },
  { id: "l3-73", text: "color", category: "activities", usage: 0, level: 3, image: colorImg },
  { id: "l3-74", text: "draw", category: "activities", usage: 0, level: 3, image: drawImg },
  { id: "l3-75", text: "sing", category: "activities", usage: 0, level: 3, image: singImg },
  { id: "l3-76", text: "dance", category: "activities", usage: 0, level: 3, image: danceImg },
  { id: "l3-77", text: "watch TV", category: "activities", usage: 0, level: 3, image: watchTvImg },
  { id: "l3-78", text: "play game", category: "activities", usage: 0, level: 3, image: playGameImg },
  { id: "l3-79", text: "ride bike", category: "activities", usage: 0, level: 3, image: rideBikeImg },
  { id: "l3-80", text: "go swimming", category: "activities", usage: 0, level: 3, image: goSwimmingImg },
  { id: "l3-81", text: "build blocks", category: "activities", usage: 0, level: 3, image: buildBlocksImg },
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
      version: 4, // Increment to force card updates with all Level 2 and 3 images
      migrate: (persistedState: any, version: number) => {
        if (version < 4) {
          // Force reload with new card data including all Level 2 and 3 images
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
