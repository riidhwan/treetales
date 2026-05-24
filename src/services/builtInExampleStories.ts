import { sortByCreatedAt } from '@/lib/sorting'
import { createIndexedDbRepositoryUnitOfWork } from '@/repositories/indexedDb/unitOfWork'
import type { Chapter, Story, StoryProvenance } from '@/services/types'

export interface BuiltInExampleStorySummary {
  readonly id: string
  readonly title: string
  readonly description: string
  readonly storyProvenance: StoryProvenance
}

export type CreateOrReuseExampleStoryCopyResult =
  | {
      readonly status: 'created' | 'reused'
      readonly story: Story
      readonly chapters: Chapter[]
    }
  | {
      readonly status: 'not-found'
    }

interface BuiltInExampleStoryDefinition extends BuiltInExampleStorySummary {
  readonly chapters: readonly BuiltInExampleChapterDefinition[]
}

interface BuiltInExampleChapterDefinition {
  readonly templateId: string
  readonly title: string
  readonly content: string
  readonly parentTemplateId: string | null
}

const BUILT_IN_EXAMPLE_STORIES: readonly BuiltInExampleStoryDefinition[] = [
  {
    id: 'bee-man-of-orn',
    title: 'The Bee-Man of Orn',
    description:
      'A wandering bee-keeper follows an old prophecy toward an unexpected identity.',
    storyProvenance: {
      sourceWorks: [
        {
          title: 'The Bee-Man of Orn',
          author: 'Frank R. Stockton',
          publication:
            'The Bee-Man of Orn and Other Fanciful Tales, first published 1887',
          publicDomainBasis:
            'Project Gutenberg eBook #12067, public domain in the USA.',
        },
      ],
      adaptationNote:
        'Adapted into a branching TreeTales starter from the source premise. The main path follows the Bee-Man through the domain, mountain, dragon rescue, and magical return; alternate branches let him reject the prophecy, retreat from danger, or keep his old shape after the rescue.',
      displayText:
        'Adapted from "The Bee-Man of Orn" by Frank R. Stockton, first published 1887.',
    },
    chapters: [
      {
        templateId: 'intro',
        title: 'The Hive at Orn',
        content: `The Bee-Man lives at the edge of Orn in a hut that is more hive than house. Honeycomb fills the corners, bees work in the pocket of his old leather doublet, and the villagers know him as the strange, brown, contented keeper of every buzzing swarm.

One afternoon a Junior Sorcerer stops beside the hives with a troubling announcement: by the rules of magic, the Bee-Man has been transformed from some other shape. The sorcerer cannot say what that shape was, but he promises that learned masters can restore it if the Bee-Man discovers the truth.

The old peace of the hut begins to hum with questions. If the Bee-Man has a proper form somewhere in the world, should he search for it, or should he trust the life his bees already know?`,
        parentTemplateId: null,
      },
      {
        templateId: 'begin-quest',
        title: 'Carry the Traveling Hive',
        content: `Before sunrise the Bee-Man binds a new hive of twigs and straw to his back. He fills it with comb, bees, and enough honey for the road, then leaves Orn with a cloud of companions glittering around him.

He decides that his old skill may serve the new search. When he finds a bee tree, something in him says, "That is what you are looking for." Perhaps his original form will call to him in the same way.

By noon the question has grown sharper: if he was once noble, monstrous, helpless, or ordinary, is honesty enough reason to become that thing again?`,
        parentTemplateId: 'intro',
      },
      {
        templateId: 'keep-hive',
        title: 'Stay with the Bees',
        content: `The Bee-Man listens to the low talk of the hive until the Junior Sorcerer's certainty begins to sound less certain. The bees know him by his hands, his step, and the smoke he never uses too roughly. None of them waits for a better Bee-Man to arrive.

When the sorcerer returns for notes, the Bee-Man offers him honey and a plain answer. He will not spend his last strength chasing a shape that has never fed a bee, saved a swarm, or shared a winter roof with him.

The Junior Sorcerer goes away disappointed, but the Bee-Man sleeps well. In Orn, the hives prosper, and the villagers learn that a prophecy may be loud without being wise.`,
        parentTemplateId: 'intro',
      },
      {
        templateId: 'fair-domain',
        title: 'Search the Fair Domain',
        content: `The road leads to a rich domain of lawns, gardens, bright horses, silken guests, and a palace whose windows flash like water. The Bee-Man hides his hive and doublet behind a shrub so his bees will not frighten the polished company.

For two days he watches every creature there: noble riders, songbirds, sleek dogs, jeweled ladies, and the handsome Lord of the Domain. If beauty and power are signs of an original form, this place has signs enough.

Yet the Bee-Man cannot tell whether he is drawn toward truth or merely dazzled by comfort.`,
        parentTemplateId: 'begin-quest',
      },
      {
        templateId: 'black-mountain',
        title: 'Enter the Black Mountain',
        content: `Beyond the domain rises a black mountain with a cave-mouth at its foot. The Bee-Man has heard that its tunnels hold dragons, imps, and unpleasant creatures whose names are better left unpracticed.

At the entrance he meets a Languid Youth who has come to have his energies improved, provided someone else will do the entering first. Together they step into the dark, where a polished little imp offers horrors as if they were medicines.

If the Bee-Man was once something dreadful, the mountain may tell him. If he was not, it may still test what sort of creature he has become.`,
        parentTemplateId: 'begin-quest',
      },
      {
        templateId: 'approach-lord',
        title: 'Follow the Lord of the Domain',
        content: `The Bee-Man follows the Lord of the Domain through the garden paths, hoping for the pull that will prove a former life of rank and ease. Instead, the lord turns, sees a shabby old man behind him, and drives him into the bushes with a contemptuous kick.

The Bee-Man runs back to his hidden hive with more certainty than he has found anywhere else. Whatever he once was, he was not a person who would strike a poor stranger for standing in a garden.

He leaves the domain poorer in illusions, but richer in one useful rule: a true form cannot be measured by velvet, horses, or the size of a gate.`,
        parentTemplateId: 'fair-domain',
      },
      {
        templateId: 'become-lord',
        title: 'Claim the Palace Shape',
        content: `The Bee-Man mistakes longing for recognition and sends for the sorcerers before the Lord of the Domain ever turns around. They are delighted by so neat an answer and transform him into a nobleman with polished boots, a ringing bell, and servants who expect orders.

For a week he tries to live as if the palace were his natural hive. But bees gather at the windows, beggars wait at the gates, and every command sounds strange in his mouth.

At last he opens the storehouses, gives away the honeyed cakes, and walks back toward Orn in borrowed clothes. The sorcerers call it a failed restoration; the Bee-Man calls it proof that splendor can be another kind of disguise.`,
        parentTemplateId: 'fair-domain',
      },
      {
        templateId: 'rescue-child',
        title: 'Throw the Hive at the Dragon',
        content: `Deep in the mountain, a black dragon with fiery wings carries a crying child into its cave. The Bee-Man's first thought is to run, and his second is worse: someone ought to do something.

He hurries back for his traveling hive, charges into the cave, and throws it straight at the dragon's face. The hive bursts, the bees pour out in a furious storm, and the dragon staggers backward under stings to its eyes, nose, and smoking mouth.

While the bees fight like an army, the Bee-Man gathers up the child and runs for daylight.`,
        parentTemplateId: 'black-mountain',
      },
      {
        templateId: 'leave-mountain',
        title: 'Turn Back from the Roar',
        content: `The dragon's roar shakes dust from the ceiling, and the Bee-Man imagines claws, fire, and a future in which no one ever learns what he used to be. He takes one step toward the cave, then another step away.

Outside, the Languid Youth praises caution, but the Bee-Man hears the baby's cry long after the mountain has fallen behind them. He may still find the Junior Sorcerer, and he may still gain a restored shape, but one question follows him louder than the prophecy.

If his original form was brave, why did it not answer when someone needed him?`,
        parentTemplateId: 'black-mountain',
      },
      {
        templateId: 'return-child',
        title: 'Return the Lost Child',
        content: `The Bee-Man and the newly energetic Youth carry the child into a nearby village. A woman sits outside her cottage tearing at her hair with grief, and when she sees the child she runs forward with a cry that leaves no doubt.

The mother covers the child with kisses and thanks the Bee-Man until he grows embarrassed. Neighbors bring food, water, and a soft place to rest. For the first time since leaving Orn, the Bee-Man feels strongly drawn toward a living being - not a lord, not a monster, but the small rescued child.

Perhaps, he thinks, he was transformed from a baby. Every life begins there. Every old shape once had that chance.`,
        parentTemplateId: 'rescue-child',
      },
      {
        templateId: 'fresh-start',
        title: 'Accept the Fresh Start',
        content: `The Junior Sorcerer arrives with senior masters, all very pleased to find a case that can be written up neatly. They perform the restoration, and the Bee-Man becomes a baby in the grateful mother's arms.

The sorcerers congratulate one another. The Youth goes home full of energy. The child grows under a kind roof, learns the hum of summer fields, and one day wanders farther and farther toward Orn.

Years later an old Senior Sorcerer passes a small hut alive with bees. Inside sits a leathery old man eating honey. The sorcerer knows him at once and can only stare: the fresh start has grown, by its own nature, back into a Bee-Man.`,
        parentTemplateId: 'return-child',
      },
      {
        templateId: 'chosen-shape',
        title: 'Keep the Shape That Helped',
        content: `The Bee-Man sends word to the Junior Sorcerer, but not for a transformation. He asks the young magician to witness the answer he has found.

He was drawn to the child because the child needed him, not because he used to be one. The hive on his back, his tough skin, his patience with small winged lives - these were not mistakes to be corrected. They were the very things that let him save someone.

So the Bee-Man returns to Orn unchanged. Sometimes the rescued child visits and sits safely among the hives. When people ask what he was transformed from, he gives them honey and says he has stopped asking the question backward.`,
        parentTemplateId: 'return-child',
      },
    ],
  },
  {
    id: 'magicians-gifts',
    title: "The Magicians' Gifts",
    description:
      'Three gifts promise power, but each choice asks what kind of wisdom is worth keeping.',
    storyProvenance: {
      sourceWorks: [
        {
          title: "The Magicians' Gifts",
          author: 'Juliana Horatia Ewing',
          publication: 'Old-Fashioned Fairy Tales, first published 1880',
          publicDomainBasis:
            'Project Gutenberg eBook #15592, public domain in the USA.',
        },
      ],
      adaptationNote:
        'Adapted into a branching TreeTales starter from the source premise. The main path follows the prince from christening gifts through misused wishes, failed counsel, remorse, self-command, and restoration; alternate branches let him learn earlier from wise counsel, cling to command, or choose humility after harm.',
      displayText:
        'Adapted from "The Magicians\' Gifts" by Juliana Horatia Ewing, first published 1880.',
    },
    chapters: [
      {
        templateId: 'intro',
        title: 'Three Gifts at the Cradle',
        content: `At the christening of the king's eldest son, three magicians stand beside the cradle. One has been honored as godfather, while the other two hide their anger under smiles and dark sleeves.

The godfather gives the child a dazzling promise: whatever the prince wishes for, he shall have. The jealous magicians bend the gift into danger. No wish can be recalled, and the prince will carry a hasty temper strong enough to speak before wisdom can stop him.

The court laughs at the danger. The godfather leaves with a troubled face. Years later, the prince begins to learn that power is not the same thing as freedom.`,
        parentTemplateId: null,
      },
      {
        templateId: 'reckless-prince',
        title: 'Wishes That Cannot Turn Back',
        content: `As a child, the prince can summon rare toys, banish storms from a hunt, or make a stubborn door fly open with one impatient word. But every wish remains exactly as spoken, even when regret arrives a heartbeat later.

Counsellors try to teach caution. One by one, they thwart him for his own good, and one by one his anger sends them where no apology can follow. The king begins to fear his son almost as much as he loves him.

At last the court agrees that the godfather magician must be found. If the gift can be recalled, perhaps the prince can become only a prince again.`,
        parentTemplateId: 'intro',
      },
      {
        templateId: 'ask-for-ordinary',
        title: 'Ask for an Ordinary Blessing',
        content: `Before the jealous magicians speak, the young godfather bends over the cradle and hesitates. In this path, the king notices his fear and asks for a smaller blessing: not command over the world, but the patience to learn before ruling it.

The offended magicians grumble that such a gift is difficult to spoil. They add a spark of temper, but without boundless wishes the spark must meet ordinary consequences.

The prince grows with arguments, apologies, lessons, and repairs. He never becomes the marvel his father expected, but the kingdom comes to prefer a ruler whose words are promises rather than spells.`,
        parentTemplateId: 'intro',
      },
      {
        templateId: 'wise-woman',
        title: 'The Narrowest Road',
        content: `Following a beggar's dream, the king takes the narrowest of seven roads and finds a wise woman beside a cave fire. She says the godfather cannot undo the jealous gifts, and that the prince must instead learn prudence and self-rule.

She returns to court as guardian. Her patience is unshowy, but it holds where the courtiers failed. When anger rises, she gives the prince silence, distance, and tasks small enough for a proud heart to attempt.

For a time the palace breathes more easily. Then the prince grows ashamed of being guided by an old woman and wishes for an adviser nearer his own age.`,
        parentTemplateId: 'reckless-prince',
      },
      {
        templateId: 'royal-command',
        title: 'Rule by Wishing',
        content: `The prince rejects the search for his godfather. If every desire becomes law, he reasons, then the only sensible plan is to desire more carefully and rule without interference.

At first the court becomes astonishingly efficient. Roads are finished overnight, taxes collect themselves, and any minister who objects disappears before the second sentence.

But no one dares bring unwelcome news. The prince's wishes grow lonely and brittle, and the kingdom learns that a ruler who can have anything may lose the one thing command cannot create: honest counsel.`,
        parentTemplateId: 'reckless-prince',
      },
      {
        templateId: 'young-adviser',
        title: 'The Faithful Young Adviser',
        content: `A young nobleman arrives the same day the prince wishes for a faithful adviser of his own age. He is able, discreet, and brave enough to disagree gently. The prince loves him for it, until one sharp hour when advice feels like accusation.

"Hold your tongue forever," the prince cries, and the words strike like iron. His friend remains alive, loyal, and entirely unable to speak.

The prince's grief is deeper than his pride. He sets out with the silent nobleman and his clever hound to find the godfather magician before another angry sentence harms someone he loves.`,
        parentTemplateId: 'wise-woman',
      },
      {
        templateId: 'keep-wise-woman',
        title: 'Keep the Old Counsel',
        content: `The prince feels the old shame rising when courtiers whisper that a grown heir should not need an old woman's hand at his sleeve. This time he waits before wishing.

By morning he sees the trap clearly. His pride wants a splendid adviser; his kingdom needs the wise one already there. He asks the old woman to stay and gives her leave to contradict him before the full court.

No magician appears to end the gift, but fewer wishes need ending. The prince becomes famous for a strange royal habit: when anger burns hottest, he lets an old woman speak first.`,
        parentTemplateId: 'wise-woman',
      },
      {
        templateId: 'forest-hermit',
        title: 'The Hound at the Hermitage',
        content: `The hound leads the prince and his silent friend to a forest hermit. The old man offers counsel instead of directions: remain, learn self-government, and stop hunting for a magic cure to a human fault.

The prince refuses. He calls the hound away, but the animal sits at the hermit's feet and will not move. Coaxing fails. Force fails. Then rage breaks loose.

The prince wishes the hound hanged, and the faithful creature vanishes from the path. A moment later the prince sees what his words have done.`,
        parentTemplateId: 'young-adviser',
      },
      {
        templateId: 'stay-with-hermit',
        title: 'Stay Before Worse Is Done',
        content: `When the hound refuses to leave the hermit, the prince feels fury gather in his throat. He clamps both hands over his mouth until the first terrible words pass unsaid.

The hermit gives him no praise. Instead, he hands the prince a broom, a water jar, and a rule: no command spoken in anger may be obeyed, even by himself.

Months of plain work teach what courtly flattery never could. The prince returns home with the hound alive, the nobleman still silent, and the first proof that a wish can be defeated before it becomes a sentence.`,
        parentTemplateId: 'young-adviser',
      },
      {
        templateId: 'glass-coffin',
        title: 'The Glass Coffin',
        content: `Carrying the hound's body, the prince enters a neighboring kingdom and meets a princess renowned for wisdom. He loves her almost at once, and his wish makes refusal impossible.

At her counsel, he keeps the hound in a glass coffin as a daily warning. For a while love makes him careful. Then familiarity loosens his guard, and one quarrel becomes a storm.

The princess begs him to remember the hound. Instead he wishes her beside it, and the glass coffin holds them both.`,
        parentTemplateId: 'forest-hermit',
      },
      {
        templateId: 'penitent-return',
        title: 'Return to the Hermit',
        content: `The prince can no longer pretend that finding the godfather is enough. With the silent nobleman beside him, he carries the glass coffin back to the forest and asks for the harder road.

The hermit teaches him to live after remorse without making remorse another kind of selfishness. Each day the prince names what anger has cost and then practices one act of patience.

When he returns to court, he stands beside the coffin and rules slowly. The kingdom sees sorrow in him, but also gentleness that was never there before.`,
        parentTemplateId: 'glass-coffin',
      },
      {
        templateId: 'give-up-crown',
        title: 'Lay Down the Crown',
        content: `After the princess falls, the prince refuses to return to court. If his words can bend lives until they break, he will not sit where every servant must tremble.

He sends his signet home with the silent nobleman and remains in the forest, tending paths, copying books, and warning travelers about the danger of wanting too quickly.

The gift is never recalled in triumph. Yet the prince harms no one else, and the kingdom remembers him as the heir who discovered that some power can only be governed by giving it up.`,
        parentTemplateId: 'glass-coffin',
      },
      {
        templateId: 'gift-recalled',
        title: 'The Godfather Returns',
        content: `When the prince has learned patience by daily practice rather than sudden shame, a man in a long black robe comes to him and calls him godson.

The magician reveals that he was the wise woman and the hermit all along. He could recall his own gift, but not the temper placed by another, and so he waited until the prince had learned to master what magic could not remove.

Then the godfather reclaims the wish-power. Its effects vanish with it: the princess rises, the hound stretches, the nobleman speaks, and the counsellors return from the sea to find their papers exactly where they left them.`,
        parentTemplateId: 'penitent-return',
      },
    ],
  },
  {
    id: 'wonderful-toymaker',
    title: 'The Wonderful Toymaker',
    description:
      'A royal nursery, a strange craftsman, and a toy that may teach more than obedience.',
    storyProvenance: {
      sourceWorks: [
        {
          title: 'The Wonderful Toymaker',
          author: 'Evelyn Sharp',
          publication: 'All the Way to Fairyland, first published 1898',
          publicDomainBasis:
            'Project Gutenberg eBook #30400, public domain in the USA.',
        },
      ],
      adaptationNote: `Adapted into a branching TreeTales starter from the source premise. The main path follows Princess Petulant, Martin, the pine dwarfs, the conversation country, the rescue, and the Toymaker's two tops; alternate branches let the Princess practice patience, Martin become trapped by talk, or the children stay longer with the Toymaker.`,
      displayText:
        'Adapted from "The Wonderful Toymaker" by Evelyn Sharp, first published 1898.',
    },
    chapters: [
      {
        templateId: 'intro',
        title: 'No Toy Will Do',
        content: `Princess Petulant has every toy the royal nursery can hold, and none of them is new enough. She cries on the floor until the nurses sigh, the court whispers, and the King calls a council to ask why a well-dressed government cannot invent one more amusement.

The Prime Minister suggests Martin, his quiet son, who would rather dream than become Prime Minister. Martin sits beside the Princess and promises to find a new toy if she promises not to scold him for running faster, growing quiet, or ending a game before she is ready.

The Princess agrees at once. Martin gives himself four weeks and sets out toward the fairy places that most adults have forgotten how to find.`,
        parentTemplateId: null,
      },
      {
        templateId: 'ask-bobolink',
        title: 'Ask the Purple Enchanter',
        content: `Martin visits Bobolink, the Purple Enchanter, whose grove and throne and enormous toads are purple enough to unsettle even a brave child. Instead of flattering him, Martin says honestly that Bobolink seems to have become sunpurpled.

The enchanter likes this more than compliments. He cannot reveal the Wonderful Toymaker's valley himself, because that secret belongs to the pine dwarfs, but he gives Martin a route made of turnings, counting, and one dizzy spin.

If Martin can find the pine dwarfs and keep their kind of silence, he may still reach the Toymaker in time.`,
        parentTemplateId: 'intro',
      },
      {
        templateId: 'wait-for-martin',
        title: 'Wait Without Crying',
        content: `Princess Petulant wants to cry before the first day has ended. Instead, she remembers her promises and chooses one old toy to repair, then another to give away, then another to turn into a game for the nursery page.

Four weeks pass slowly, but not emptily. The palace grows quieter because the Princess is practicing the hardest game she knows: waiting without making everyone else wait on her temper.

When Martin returns empty-handed in this path, she is disappointed but not cruel. Together they discover that an old toy can become new when two people agree on new rules.`,
        parentTemplateId: 'intro',
      },
      {
        templateId: 'pine-dwarfs',
        title: 'The Pine Dwarfs Secret',
        content: `After the hundred and first right turn, the fifty-second left turn, and seventeen spins, Martin finds himself in a pine wood so still that even a whisper seems like a guest.

The pine dwarfs slide down the trunks like living cones. They tell him that the Toymaker lives beyond the waterfall, down the stream, and through the country where people make conversation. To pass safely, Martin must not speak one word until he reaches the valley.

Martin is sure silence will be easy. The pine dwarfs sigh through the branches as though they have heard that confidence before.`,
        parentTemplateId: 'ask-bobolink',
      },
      {
        templateId: 'wrong-turnings',
        title: 'Lose Count of the Turnings',
        content: `Martin reaches the seventy-ninth turning, or perhaps the eighty-first, just as a market bell begins to ring and a cart spills apples across the road. By the time he helps gather them, the numbers have tangled beyond repair.

He tries guessing. The guesses lead to a hill of wooden whistles, a meadow of sulking kites, and a door that opens only for people who have brought exact directions.

Martin returns to the palace with no new toy, but he brings one useful truth: some quests fail when attention wanders, and a promise may need another attempt rather than another excuse.`,
        parentTemplateId: 'ask-bobolink',
      },
      {
        templateId: 'conversation-country',
        title: 'The Country That Makes Conversation',
        content: `Martin follows the stream into a noisy country where voices chatter from water, grass, flowers, and air. Questions buzz around his ears until he clamps both hands over them and runs.

Then a friendly comma-fish lifts its bent back from the stream and greets him. Martin forgets the warning for one small answer, and the invisible voices cheer. He has spoken; now they can make conversation of him.

The voices carry him into a glass palace where every chair, door, window, pony, knife, and sweet asks questions, tells stories, and refuses to be quiet.`,
        parentTemplateId: 'pine-dwarfs',
      },
      {
        templateId: 'keep-silent',
        title: 'Hold the Silence',
        content: `The voices grow clever. They ask Martin about cakes, kings, parties, his favorite sweets, and whether he thinks they are amusing. He nearly answers the fish in the stream, but the pine wood's silence is still fresh in him.

He bows to the fish instead of speaking and keeps walking while the questions chase him. By dusk the voices thin, the stream widens, and the hills around the Toymaker's valley rise ahead.

Martin reaches the valley alone, carrying no rescue story with him, but also no prison of chatter.`,
        parentTemplateId: 'pine-dwarfs',
      },
      {
        templateId: 'princess-rescue',
        title: 'The Princess Stops Her Ears',
        content: `When the four weeks end and Martin has not returned, Princess Petulant almost falls back into royal sobbing. A pine dwarf appears and tells her that Martin is trapped where noise is made into conversation.

The Princess asks for help instead of another toy. With cotton wool from a kindly bird tucked into her ears, she runs beside the stream without answering a single question.

At the glass palace she does not wait for the door. She throws a stone through the wall, climbs inside, and finds Martin with his head in his hands.`,
        parentTemplateId: 'conversation-country',
      },
      {
        templateId: 'made-into-conversation',
        title: 'Become Conversation',
        content: `Martin tries to endure the glass palace by accepting its gifts. A real pony tells him its entire childhood. A gold watch tells stories instead of time. A six-bladed knife repeats every complaint six times.

When the voices ask him to be king of the palace, he answers once, then twice, then every hour. Soon his own words are caught up, polished, repeated, and sent back at him until even his thoughts begin to sound like interruptions.

The Princess waits, but no message reaches her. In this ending, Martin learns too late that not every bright palace is a place where a quiet promise can survive.`,
        parentTemplateId: 'conversation-country',
      },
      {
        templateId: 'toymaker-valley',
        title: 'The Valley of Toys',
        content: `The children leave the glass palace hand in hand and climb to the hill above the Toymaker's valley. Below them, toys hang from trees, blossom from bushes, heap on rocks, and cover the ground in colors no nursery has ever imagined.

The Wonderful Toymaker runs to meet them, young from thousands of years of making play. He is delighted at last to have visitors who can play with him instead of merely wanting something from him.

He brings out two new tops: one that sings every sound in the world, and one that sings sounds found only in Fairyland.`,
        parentTemplateId: 'princess-rescue',
      },
      {
        templateId: 'choose-world-top',
        title: 'Choose the World-Singing Top',
        content: `Princess Petulant chooses the bright top that hums with birds, winds, quarrels, laughter, tears, and every ordinary noise she had once tried to drown with crying.

When she brings it home, the court expects a toy that will keep her quiet. Instead, it teaches her to listen. She hears when the nurses are tired, when Martin wants silence, and when a game has become fun for only one person.

The top never grows old, because the world keeps changing its song.`,
        parentTemplateId: 'toymaker-valley',
      },
      {
        templateId: 'choose-fairy-top',
        title: 'Choose the Fairyland Top',
        content: `Martin chooses the copper top that sings what cannot be described: the sound of a fairy path opening, of a dream deciding to become useful, of silence filled with hidden music.

The Prime Minister is disappointed that the toy does not train Martin for office. Martin is not disappointed. He keeps the top near him and learns that dreaming is not the opposite of doing, if a dream can lead someone all the way home.

Years later, people say he never became Prime Minister because he became something less predictable and much happier.`,
        parentTemplateId: 'toymaker-valley',
      },
      {
        templateId: 'stay-and-play',
        title: 'Stay One More Game',
        content: `The Toymaker asks the children to stay. There will be toys that do not break, races that never tire them, and unwholesome sweets that somehow do no harm.

For one more game they agree. Then one more. At last the palace, the Queen, and all old promises feel distant, as if they belong to children in another tale.

The valley is joyful, but it asks a price: if play never ends, it stops being a gift carried home and becomes another kind of forgetting.`,
        parentTemplateId: 'toymaker-valley',
      },
      {
        templateId: 'rocking-horses-home',
        title: 'Ride the Rocking-Horses Home',
        content: `The Toymaker is sad to see them leave, but he respects the promises that call them home. He gives them rocking-horses for the road, and the wooden horses race so fast that land feels almost like sky.

At the palace gates the horses vanish. The Queen dries her tears, the King dismisses the useless council, and Martin and Princess Petulant spin their tops for the whole court.

They never lose the gifts. The Princess learns to want without wounding, Martin learns that quietness can still be brave, and the kingdom becomes more playful than any council could have planned.`,
        parentTemplateId: 'toymaker-valley',
      },
    ],
  },
] as const

const repositoryUnitOfWork = createIndexedDbRepositoryUnitOfWork()

export function listBuiltInExampleStories(): BuiltInExampleStorySummary[] {
  return BUILT_IN_EXAMPLE_STORIES.map((starter) => ({
    id: starter.id,
    title: starter.title,
    description: starter.description,
    storyProvenance: starter.storyProvenance,
  }))
}

export async function createOrReuseExampleStoryCopy(
  builtInExampleStoryId: string,
): Promise<CreateOrReuseExampleStoryCopyResult> {
  const builtInExampleStory = BUILT_IN_EXAMPLE_STORIES.find(
    (starter) => starter.id === builtInExampleStoryId,
  )

  if (!builtInExampleStory) {
    return { status: 'not-found' }
  }

  return repositoryUnitOfWork.run(async ({ stories, chapters }) => {
    const existingStory = await stories.findStoryByBuiltInExampleStoryId(
      builtInExampleStory.id,
    )

    if (existingStory) {
      const existingChapters = await chapters.findChaptersByStoryId(
        existingStory.id,
      )

      return {
        status: 'reused',
        chapters: sortByCreatedAt(existingChapters),
        story: existingStory,
      }
    }

    const now = Date.now()
    const story: Story = {
      id: crypto.randomUUID(),
      title: builtInExampleStory.title,
      description: builtInExampleStory.description,
      builtInExampleStoryId: builtInExampleStory.id,
      storyProvenance: builtInExampleStory.storyProvenance,
      createdAt: now,
      updatedAt: now,
    }
    const exampleChapters = createExampleChapters(
      builtInExampleStory.chapters,
      story.id,
      now,
    )

    await stories.insertStory(story)

    for (const chapter of exampleChapters) {
      await chapters.insertChapter(chapter)
    }

    return {
      status: 'created',
      chapters: exampleChapters,
      story,
    }
  })
}

function createExampleChapters(
  chapterDefinitions: readonly BuiltInExampleChapterDefinition[],
  storyId: string,
  createdAt: number,
): Chapter[] {
  const chapterIdsByTemplateId = new Map(
    chapterDefinitions.map((chapterDefinition) => [
      chapterDefinition.templateId,
      crypto.randomUUID(),
    ]),
  )

  return chapterDefinitions.map((chapterDefinition, index) => {
    const id = chapterIdsByTemplateId.get(chapterDefinition.templateId)
    const parentChapterId = chapterDefinition.parentTemplateId
      ? chapterIdsByTemplateId.get(chapterDefinition.parentTemplateId)
      : null

    if (!id || parentChapterId === undefined) {
      throw new Error('Built-in Example Story chapter definition is invalid.')
    }

    return {
      id,
      storyId,
      title: chapterDefinition.title,
      content: chapterDefinition.content,
      parentChapterId,
      createdAt: createdAt + index,
      updatedAt: createdAt + index,
    }
  })
}
