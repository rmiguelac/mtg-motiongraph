## Getting images for new decks

To get images for decks, these are the steps:

0. Decks are from the Magic the Gathering Pauper format
1. Get the deck name
2. Using the deck name, search for the deck list in the mtg goldfish or mtg top 8 pauper deck metagame
3. Look through the deck list and get the card that gives the deck its name.
4. For the card name, visit the scryfall and get the card image url. Use the crop image endpoint.
5. save the card image with deck name, just like the existing ones.
6. update the code to use it, just like we've been doing for the others.

## Updating the data

When the user provides an image and the decklist that the players used, follow these steps:

1. Parse the image as to follow the pattern in the data/data.csv
2. Add new rows to the data.csv, making sure the order, the player name, their points and victory/defeate/draw is captured correctly. The rows should also have a column for the date, following the format YYYY.MM.DD. If this instruction does not contradict the data, there should be also a column with the month name (for filtering purposes).
3. With the decklist provided, update the newly inserted data following the same order, adding the deck information. If there are typos in the deck name or there are very similar decks already listed, use the existing name, but make sure this choice is brought to the user.
4. After the data is updated, check if there are new decks among the ones just added.
4.1. If there are any, execute the 'Getting images for new decks' and add the deck to the code.
5. When its all done, double-check the steps and make sure the data is matching the image and the decklist, correctly ordered. 