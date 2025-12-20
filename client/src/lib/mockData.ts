import { useState, useEffect } from "react";

export interface Chapter {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string; // Markdown content
  publishedAt: string;
  readTime: number; // in minutes
  order: number;
}

export interface UserProgress {
  chapterId: string;
  scrollPosition: number; // percentage 0-100
  completed: boolean;
  lastReadAt: string;
}

// MOCK DATA
export const CHAPTERS: Chapter[] = [
  {
    id: "1",
    slug: "chapter-1-web-of-beginnings",
    title: "Chapter 1: The Web of Beginnings",
    excerpt: "In which Ananse discovers that not all stories are meant to be told, and some threads are better left loose.",
    publishedAt: "2025-12-01T08:00:00Z",
    readTime: 5,
    order: 1,
    content: `
The dust of the harmattan season had settled on the village of Nsawam, coating the rooftops in a fine, ochre powder. It was the kind of heat that made the air shimmer, blurring the lines between the solid earth and the spirit world.

Kwaku Ananse sat beneath the great Baobab tree, his legs crossed, his eyes closed. He was not sleeping, though to the casual observer, it might have appeared so. No, Ananse was listening. He was listening to the whispers of the wind, the gossip of the insects, and the distant hum of the modern world encroaching on his ancient sanctuary.

"They say the Golden Stool has moved," a small spider whispered, descending from a branch on a silken thread.

Ananse opened one eye. "Moved? Stools do not have legs, my little friend. Unless, of course, they are being carried."

"Stolen," the spider corrected, its many eyes blinking in rapid succession. "Taken from the palace in the dead of night. The Ashanti King is furious. The spirits are restless."

Ananse sighed, uncrossing his legs and stretching his arms. He had hoped for a quiet retirement. A few pranks here and there, perhaps a trick played on a pompous politician, but nothing that would involve the spirits of the ancestors or, worse, the police.

"Why tell me?" Ananse asked, dusting off his knees. "I am just an old storyteller. My days of trickery are behind me."

The spider chuckled, a sound like dry leaves rustling. "Because, Kwaku, everyone knows that when something valuable goes missing, Ananse is either the culprit or the only one clever enough to find it."

Ananse smiled, a slow, sly curving of his lips. It was true. He *was* clever. And the Golden Stool... well, that was a prize worth a story or two.

He stood up, adjusting his kente cloth. "Very well," he said to the spider. "Tell the wind I am listening. Tell the earth I am walking. Ananse is on the case."

***

The journey to Kumasi was not what it used to be. In the old days, Ananse would have hitched a ride on the back of a hawk or spun a web across the forest canopy. Today, he took a 'tro-tro', a rusted minibus packed with people, chickens, and sacks of yam.

He squeezed into a seat between a woman selling smoked fish and a young man wearing headphones, tapping his foot to a rhythm only he could hear. Ananse closed his eyes, letting the noise of the vehicle wash over him.

The Golden Stool. Sika Dwa Kofi. It was more than just a throne; it was the soul of the Ashanti nation. To steal it was to steal the heart of the people. Who would dare such a thing?

As the tro-tro rumbled towards the city, Ananse began to spin a plan in his mind. It would be a web of lies, truths, and half-truths. A web that would catch a thief.
    `
  },
  {
    id: "2",
    slug: "chapter-2-whispers-in-kumasi",
    title: "Chapter 2: Whispers in Kumasi",
    excerpt: "The city lights hide many secrets, and Ananse finds himself navigating a maze of neon and shadow.",
    publishedAt: "2025-12-02T08:00:00Z",
    readTime: 7,
    order: 2,
    content: `
Kumasi was alive. It breathed smoke and exhaust, pulsed with the beat of highlife music, and sweated under the relentless sun. Ananse stepped off the tro-tro at Kejetia Market, the largest market in West Africa, a labyrinth of stalls, shouts, and smells.

If you wanted to find something lost, Kejetia was the place to start. Everything ended up here eventually. Lost keys, lost loves, lost souls.

Ananse made his way through the crowd, moving with a grace that belied his age. He wasn't looking for the Stool here – that would be too easy, and too dangerous. No, he was looking for information.

He found his contact at a small chop bar tucked away behind a stack of shipping containers. Old Papa Kofi was stirring a massive pot of light soup, the aroma of ginger and garden eggs filling the air.

"Kwaku!" Papa Kofi boomed, wiping his hands on a rag. "I heard you were back in the game."

"News travels faster than a falcon," Ananse muttered, taking a seat on a plastic stool. "I need to know who has been spending big money lately. New money. Nervous money."

Papa Kofi lowered his voice. "There are rumors, Kwaku. Strange men in dark suits. They speak with foreign accents but walk like they own the ground. They were asking about the Palace guards. Bribes were mentioned."

"Foreigners?" Ananse frowned. This complicated things. "What kind of foreigners?"

"The kind that deal in art," Papa Kofi said, ladling soup into a bowl. "Collectors. They don't care about the spirit of the Stool. They only care about the gold."

Ananse took the bowl, the steam warming his face. "Art collectors," he mused. "Men who trap beauty in glass cases."

He took a sip of the spicy soup. It tasted like home. It tasted like strength.

"I will need a suit," Ananse said suddenly. "And a fake ID. And perhaps... a very convincing forgery."

Papa Kofi laughed. "Same old Ananse. Always spinning a web."

"The fly must not know it is caught until it is too late," Ananse replied with a wink.

***

That night, Ananse visited the Cultural Centre. Not as a visitor, but as a shadow. He climbed the walls with ease, his limbs sticking to the stone. He slipped through a ventilation shaft and dropped silently into the curator's office.

He needed the guest list for the upcoming 'Ashanti Gold' exhibition. If there were foreign collectors in town, they would be there.

He found the list on a tablet on the desk. He scrolled through the names. Most were familiar – local politicians, business tycoons. But one name stood out.

*Julian Vane. British Museum of Antiquities (Consultant).*

Ananse narrowed his eyes. Vane. A man known for acquiring the 'unacquirable'.

"Got you," Ananse whispered.
    `
  },
  {
    id: "3",
    slug: "chapter-3-the-gilded-trap",
    title: "Chapter 3: The Gilded Trap",
    excerpt: "A high-stakes gala, a missing artifact, and a spider in a tuxedo. What could possibly go wrong?",
    publishedAt: "2025-12-03T08:00:00Z",
    readTime: 6,
    order: 3,
    content: `
The Golden Tulip Hotel was hosting the gala. Luxury cars lined the driveway, depositing men in tuxedos and women in glittering evening gowns. Ananse stepped out of a taxi, adjusting his bow tie. He looked dashing, if he did say so himself.

He had 'borrowed' the invitation from a careless dignitary earlier that day. A little sleight of hand, a little misdirection. Child's play.

Inside, the ballroom was a sea of champagne and polite conversation. Ananse moved through the room, snatching a glass of sparkling wine from a passing tray. He scanned the faces, matching them to the photos he had studied.

There he was. Julian Vane. Tall, thin, with a nose that looked like it was permanently smelling something unpleasant. He was talking to the Minister of Culture, gesturing animatedly with a long, pale hand.

Ananse drifted closer, pretending to admire a painting on the wall.

"...impeccable provenance," Vane was saying. "A private collection in Zurich. They are willing to loan it, but the security requirements are... significant."

"We can assure you, Mr. Vane," the Minister replied, sweating slightly. "Our security is top notch."

Ananse stifled a laugh. Top notch. The same security that let a spider walk into their office?

He waited for the Minister to be pulled away by a photographer, then made his move.

"Mr. Vane," Ananse said, his voice smooth as silk. "I couldn't help but overhear. Zurich, you say?"

Vane turned, looking down his nose at Ananse. "And you are?"

"K.A. Mensah," Ananse lied. "I represent a... rival collector. One who is very interested in the pieces that *don't* make it to the museums."

Vane's eyes flickered. Greed? Fear? Interest.

"I'm afraid I don't know what you mean," Vane said coolly.

"Oh, I think you do," Ananse stepped closer, lowering his voice. "The Golden Stool. It's magnificent, isn't it? A shame to keep it hidden in a crate."

Vane stiffened. "You are mistaken, sir. The Stool is safe in the Palace."

"Is it?" Ananse smiled. "Then why are you sweating, Mr. Vane?"

It was a bluff, of course. Vane wasn't sweating. But the power of suggestion was a powerful thing.

Vane glanced around nervously. "Meet me in the garden," he hissed. "Ten minutes."

Ananse watched him walk away. The fly had landed on the web. Now, to see if the spider could hold him.

***

The garden was dark, scented with jasmine and night-blooming lilies. Ananse waited by a stone fountain.

Vane appeared from the shadows, a cigarette in his hand.

"Who are you working for?" Vane demanded. "Interpol? The Ashanti King?"

"I told you," Ananse said. "A collector. He wants the Stool. And he is willing to pay double whatever your buyer in Zurich is offering."

Vane laughed, a harsh, barking sound. "Double? Do you have any idea what the Stool is worth? It's priceless."

"Everything has a price," Ananse said. "Even a soul."

"I don't have it," Vane spat. "I was *hired* to authenticate it. To make sure it was the real deal before the exchange."

"The exchange?" Ananse pressed. "When? Where?"

"Tonight. Midnight. At the old railway station." Vane took a drag of his cigarette. "But you'll never get near it. They have armed guards. Mercenaries."

"Mercenaries," Ananse repeated. "How... exciting."

He checked his watch. 11:15 PM. He had forty-five minutes to get to the railway station, bypass a squad of mercenaries, and steal back the soul of the nation.

"Thank you, Mr. Vane," Ananse said, backing into the shadows. "You've been most helpful."

"Wait!" Vane called out. "What about my money?"

"Consider your freedom your payment," Ananse's voice drifted back from the darkness. "If you leave Ghana tonight, I might forget to mention your name to the police."

Ananse ran. He didn't have a plan yet. But he had a destination. And for a storyteller, that was usually enough.
    `
  }
];

export const getChapters = async () => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return CHAPTERS;
};

export const getChapter = async (slug: string) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return CHAPTERS.find(c => c.slug === slug);
};
