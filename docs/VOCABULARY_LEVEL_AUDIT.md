# Vocabulary level audit

October 15, 2026. Local proposal; no images generated, no Levels 4 or 5 implemented.

## Scope and principles

All 196 existing built-in cards were reviewed. The cumulative built-in totals are now 65, 160, and 196. 62 existing cards become available earlier. No existing Level 1 card was removed or delayed. No artwork, ID, category, user history, favorite, or custom card was deleted. Custom cards remain available at every level under the existing behavior.

These are selectable vocabulary sets, not a clinical progression, age rating, or test of intelligence. A personally important word may be needed at any level. Families should choose vocabulary with the AAC user and an AAC-experienced SLP rather than requiring a learner to earn broader access. Card size and Calm mode are separate controls for reducing visible choices.

The design draws on [ASHA's AAC guidance](https://www.asha.org/practice-portal/professional-issues/augmentative-and-alternative-communication/) about individualized vocabulary, core and fringe words, and consistent access; and [AssistiveWare's robust vocabulary guidance](https://www.assistiveware.com/learn-aac/4-things-every-robust-aac-has). Neither source prescribes or validates these exact three Expressly sets. They remain a product proposal needing user and SLP review.

## Changes

- Level 1 adds first-person expression, refusal, bathroom access, basic sensory descriptions, a snack choice, stomach, and a direct request for help. Existing core words remain.
- Level 2 expands daily food choices, body locations, family, comfort language, common verbs, Now and Later, and a repair response: I don't know.
- Level 3 adds the rest of the existing school/community, conversation, sensory/cognitive, hobby, and time vocabulary. Its contents are not inherently suitable only for advanced learners.
- Category visibility follows available cards rather than a second hardcoded level rule. Food and Descriptive now work at Level 1; Time works at Level 2. Existing category order and user-hidden categories remain.
- Settings show actual built-in counts from the catalog, excluding user-created cards. Levels remain freely selectable.
- Historical catalog arrays and IDs are preserved. The audited minimum levels in src/lib/vocabularyLevels.ts are applied when building the canonical catalog. Future catalog additions must be reviewed against that policy.

## Important missing words: artwork deferred

Do not mark these as implemented. No misleading image substitutions or new generated pictures were added.

First priority for an existing-level artwork batch: Hurt/Pain, Sick, Hungry, Thirsty, Break, Not, Me, My, It, This, That. Review each symbol and label with users/SLPs. Sleep has an unused older asset, but it was not added automatically because its character style is inconsistent with the current matched sets.

Next functional batch: different, again, bathroom urgency, safe/unsafe, lost, too much, and basic location words such as in/on/under. Exact vocabulary and artwork need review; urgency or refusal should not be reserved for a future advanced tier.

For later topic expansion discussions, not committed Levels 4/5: animals (dog, cat, bird, animal fish), everyday nature (tree, leaf, flower, grass, sun, rain), sports (soccer, basketball, swimming, running, tennis), equipment (sport-specific ball, bat, racket, helmet, goal). Prioritize personal interests and real settings, not an exhaustive encyclopedia. A food-fish picture must not be silently repurposed as an animal-fish symbol.

## Full existing-card placement review

The ID prefix is historical and does not determine the current minimum level. Higher levels include every lower-level card.

| Card | Stable ID | Category | Previous minimum | Revised minimum |
| --- | --- | --- | --- | --- |
| Mom | l1-1 | people | 1 | 1 |
| Dad | l1-2 | people | 1 | 1 |
| Teacher | l1-3 | people | 1 | 1 |
| Happy | l1-4 | feelings | 1 | 1 |
| Sad | l1-5 | feelings | 1 | 1 |
| Mad | l1-6 | feelings | 1 | 1 |
| Tired | l1-7 | feelings | 1 | 1 |
| Scared | l1-8 | feelings | 1 | 1 |
| Excited | l1-9 | feelings | 1 | 1 |
| Calm | l1-10 | feelings | 1 | 1 |
| Eat | l1-11 | actions | 1 | 1 |
| Drink | l1-12 | actions | 1 | 1 |
| Help | l1-13 | actions | 1 | 1 |
| Stop | l1-14 | actions | 1 | 1 |
| More | l1-15 | actions | 1 | 1 |
| All done | l1-16 | actions | 1 | 1 |
| Go | l1-17 | actions | 1 | 1 |
| Come | l1-18 | actions | 1 | 1 |
| Want | l1-19 | actions | 1 | 1 |
| Need | l1-20 | actions | 1 | 1 |
| Finished | l1-21 | actions | 1 | 1 |
| Yes | l1-22 | responses | 1 | 1 |
| No | l1-23 | responses | 1 | 1 |
| Maybe | l1-24 | responses | 1 | 1 |
| Play | l1-25 | activities | 1 | 1 |
| Read | l1-26 | activities | 1 | 1 |
| Go outside | l1-27 | activities | 1 | 1 |
| Listen to music | l1-28 | activities | 1 | 1 |
| Draw | l1-29 | activities | 1 | 1 |
| Build | l1-30 | activities | 1 | 1 |
| Toy | l1-31 | objects | 1 | 1 |
| Book | l1-32 | objects | 1 | 1 |
| Water | l1-33 | objects | 1 | 1 |
| Food | l1-34 | objects | 1 | 1 |
| Ball | l1-35 | objects | 1 | 1 |
| Chair | l1-36 | objects | 1 | 1 |
| Bed | l1-37 | objects | 1 | 1 |
| Clothes | l1-47 | objects | 1 | 1 |
| Home | l1-38 | places | 1 | 1 |
| School | l1-39 | places | 1 | 1 |
| Park | l1-40 | places | 1 | 1 |
| Store | l1-41 | places | 1 | 1 |
| Hi | l1-42 | social | 1 | 1 |
| Bye | l1-43 | social | 1 | 1 |
| Please | l1-44 | social | 1 | 1 |
| Thank you | l1-45 | social | 1 | 1 |
| Sorry | l1-46 | social | 1 | 1 |
| Hand | l1-48 | body | 1 | 1 |
| Foot | l1-49 | body | 1 | 1 |
| Head | l1-50 | body | 1 | 1 |
| Brother | l2-1 | people | 2 | 2 |
| Sister | l2-2 | people | 2 | 2 |
| Friend | l2-3 | people | 2 | 2 |
| Nurse | l2-4 | people | 2 | 2 |
| I | pronoun-i | people | 2 | 1 |
| You | pronoun-you | people | 2 | 1 |
| He | pronoun-he | people | 2 | 2 |
| She | pronoun-she | people | 2 | 2 |
| Silly | l2-6 | feelings | 2 | 2 |
| Bored | l2-7 | feelings | 2 | 2 |
| Apple | l2-8 | food | 2 | 2 |
| Banana | l2-9 | food | 2 | 2 |
| Sandwich | l2-10 | food | 2 | 2 |
| Milk | l2-11 | food | 2 | 2 |
| Juice | l2-12 | food | 2 | 2 |
| Snack | l2-13 | food | 2 | 1 |
| Cookie | l2-14 | food | 2 | 2 |
| Crayon | l2-15 | objects | 2 | 2 |
| Table | l2-16 | objects | 2 | 2 |
| Tablet | l2-17 | objects | 2 | 2 |
| Shoes | l2-18 | objects | 2 | 2 |
| Jacket | l2-19 | objects | 2 | 2 |
| Bathroom | l2-20 | places | 2 | 1 |
| Eat breakfast | l2-21 | activities | 2 | 2 |
| Eat lunch | l2-22 | activities | 2 | 2 |
| Eat dinner | l2-23 | activities | 2 | 2 |
| Brush teeth | l2-24 | activities | 2 | 2 |
| Wash hands | l2-25 | activities | 2 | 2 |
| Don't want | l2-26 | actions | 2 | 1 |
| Like | l2-27 | actions | 2 | 1 |
| Don't like | l2-28 | actions | 2 | 1 |
| Look | l2-29 | actions | 2 | 2 |
| Listen | l2-30 | actions | 2 | 2 |
| Sit | l2-31 | actions | 2 | 2 |
| Stand | l2-32 | actions | 2 | 2 |
| Wait | l2-33 | actions | 2 | 1 |
| My turn | l2-34 | social | 2 | 2 |
| Your turn | l2-35 | social | 2 | 2 |
| Open | l2-36 | actions | 2 | 2 |
| Close | l2-37 | actions | 2 | 2 |
| Good job | l2-38 | social | 2 | 2 |
| I love you | l2-39 | social | 2 | 2 |
| What? | l2-40 | social | 2 | 2 |
| Where? | l2-41 | social | 2 | 2 |
| Who? | l2-42 | social | 2 | 2 |
| When? | l2-43 | social | 2 | 2 |
| Big | l2-44 | descriptive | 2 | 2 |
| Small | l2-45 | descriptive | 2 | 2 |
| Hot | l2-46 | descriptive | 2 | 1 |
| Cold | l2-47 | descriptive | 2 | 1 |
| Quiet | l2-48 | descriptive | 2 | 1 |
| Make Bed | l2-49 | activities | 2 | 2 |
| Put Away | l2-50 | actions | 2 | 2 |
| Brush | l2-51 | actions | 2 | 2 |
| Shower | l2-52 | activities | 2 | 2 |
| Blow | l2-53 | actions | 2 | 2 |
| Nose | l2-54 | body | 2 | 2 |
| Bubbles | l2-55 | objects | 2 | 2 |
| Hair | l2-56 | body | 2 | 2 |
| Cut | l2-57 | actions | 3 | 2 |
| Nails | l2-58 | body | 3 | 2 |
| Teeth | l2-59 | body | 3 | 2 |
| Arm | l2-60 | body | 3 | 2 |
| Stomach | l2-61 | body | 3 | 1 |
| Toe | l2-62 | body | 3 | 2 |
| Finger | l2-63 | body | 3 | 2 |
| Leg | l2-64 | body | 3 | 2 |
| Grandma | l3-1 | people | 3 | 2 |
| Grandpa | l3-2 | people | 3 | 2 |
| Classmate | l3-3 | people | 3 | 3 |
| Doctor | l3-4 | people | 3 | 2 |
| Bus driver | l3-5 | people | 3 | 3 |
| Frustrated | l3-6 | feelings | 3 | 2 |
| Proud | l3-7 | feelings | 3 | 3 |
| Nervous | l3-8 | feelings | 3 | 2 |
| Surprised | l3-9 | feelings | 3 | 3 |
| Orange | l3-11 | food | 3 | 2 |
| Pizza | l3-12 | food | 3 | 2 |
| Rice | l3-13 | food | 3 | 2 |
| Chicken | l3-14 | food | 3 | 2 |
| Fish | l3-15 | food | 3 | 2 |
| Soup | l3-16 | food | 3 | 2 |
| Ice cream | l3-17 | food | 3 | 2 |
| Playground | l3-18 | places | 3 | 3 |
| Kitchen | l3-19 | places | 3 | 2 |
| Bedroom | l3-20 | places | 3 | 2 |
| Outside | l3-21 | places | 3 | 2 |
| Inside | l3-22 | places | 3 | 2 |
| Backpack | l3-23 | objects | 3 | 3 |
| Phone | l3-24 | objects | 3 | 3 |
| Computer | l3-25 | objects | 3 | 3 |
| Hat | l3-26 | objects | 3 | 3 |
| Pencil | l3-27 | objects | 3 | 3 |
| Eraser | l3-28 | objects | 3 | 3 |
| Desk | l3-29 | objects | 3 | 3 |
| Think | l3-30 | actions | 3 | 3 |
| Know | l3-31 | actions | 3 | 3 |
| See | l3-32 | actions | 3 | 2 |
| Hear | l3-33 | actions | 3 | 2 |
| Touch | l3-34 | actions | 3 | 2 |
| Feel | l3-35 | actions | 3 | 1 |
| Talk | l3-36 | actions | 3 | 2 |
| Tell | l3-37 | actions | 3 | 3 |
| Ask | l3-38 | actions | 3 | 2 |
| Say | l3-39 | actions | 3 | 2 |
| Give | l3-40 | actions | 3 | 2 |
| Take | l3-41 | actions | 3 | 2 |
| Make | l3-42 | actions | 3 | 2 |
| Find | l3-43 | actions | 3 | 2 |
| Work | l3-44 | actions | 3 | 3 |
| You're welcome | l3-47 | social | 3 | 3 |
| How are you? | l3-48 | social | 3 | 3 |
| What's wrong? | l3-49 | social | 3 | 3 |
| I don't know | l3-50 | social | 3 | 2 |
| Can I have? | l3-51 | social | 3 | 3 |
| I need help | l3-52 | social | 3 | 1 |
| Fast | l3-53 | descriptive | 3 | 2 |
| Slow | l3-54 | descriptive | 3 | 2 |
| Wet | l3-55 | descriptive | 3 | 2 |
| Dry | l3-56 | descriptive | 3 | 2 |
| Clean | l3-57 | descriptive | 3 | 2 |
| Dirty | l3-58 | descriptive | 3 | 2 |
| Loud | l3-59 | descriptive | 3 | 1 |
| Up | l3-60 | descriptive | 3 | 2 |
| Down | l3-61 | descriptive | 3 | 2 |
| Left | l3-62 | descriptive | 3 | 3 |
| Right | l3-63 | descriptive | 3 | 3 |
| Today | l3-64 | time | 3 | 3 |
| Tomorrow | l3-65 | time | 3 | 3 |
| Yesterday | l3-66 | time | 3 | 3 |
| Morning | l3-67 | time | 3 | 3 |
| Afternoon | l3-68 | time | 3 | 3 |
| Night | l3-69 | time | 3 | 3 |
| Why? | l3-70 | social | 3 | 3 |
| How? | l3-71 | social | 3 | 3 |
| Color | l3-72 | activities | 3 | 2 |
| Sing | l3-73 | activities | 3 | 2 |
| Dance | l3-74 | activities | 3 | 2 |
| Watch TV | l3-75 | activities | 3 | 3 |
| Play game | l3-76 | activities | 3 | 3 |
| Ride bike | l3-77 | activities | 3 | 3 |
| Go swimming | l3-78 | activities | 3 | 3 |
| Build blocks | l3-79 | activities | 3 | 3 |
| Now | l3-80 | time | 3 | 2 |
| Later | l3-81 | time | 3 | 2 |
| Floss | l3-82 | activities | 3 | 3 |

