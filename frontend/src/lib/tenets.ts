export type Tenet = { title: string; body: string };

/**
 * Default doctrinal tenets, shown until an admin sets their own copy in
 * Settings > About > Our Tenets (church_details: tenets_intro / tenets /
 * tenets_outro). Condensed summaries, not the full source text — each
 * keeps the core belief plus a couple of anchor references rather than
 * every citation.
 */
export const TENETS_INTRO =
  "The Church of Pentecost's roots are Evangelical and classical Pentecostal, holding to beliefs first embraced in the early twentieth century — with our own convictions on the gifts of the Spirit and divine healing.\n\nOur founding fathers prayerfully selected 11 core doctrines, each grounded in Scripture, to guard sound teaching and help every believer grow in the faith.";

export const TENETS: Tenet[] = [
  {
    title: "The Bible",
    body: "Scripture is divinely inspired, infallible, and the final authority for faith and life (2 Timothy 3:16-17).",
  },
  {
    title: "The One True God",
    body: "One God — Father, Son and Holy Spirit — all-powerful, ever-present and all-knowing (Genesis 1:1; Matthew 28:19).",
  },
  {
    title: "The Depraved Nature of Humanity",
    body: "All have sinned and fall short of God's glory, and need repentance and new birth to be reconciled to Him (Romans 3:23; John 3:3).",
  },
  {
    title: "The Saviour",
    body: "Jesus Christ — fully God, born of a virgin, crucified, risen and ascended — is the only Saviour, interceding for us now and returning to judge the living and the dead (John 1:1; 1 Corinthians 15:3-4).",
  },
  {
    title: "Repentance, Justification and Sanctification",
    body: "Through repentance and faith in Christ's atoning death, believers are justified before God and sanctified by the Holy Spirit unto eternal life (Romans 5:1; 1 Corinthians 6:11).",
  },
  {
    title: "Baptism and the Lord's Supper",
    body: "Believers are baptised by immersion from age 13; children are dedicated rather than baptised. Holy Communion is shared among members in full fellowship (Matthew 28:19; 1 Corinthians 11:23-33).",
  },
  {
    title: "Baptism, Gifts and Fruit of the Holy Spirit",
    body: "Every believer may be baptised in the Holy Spirit, with speaking in tongues as the initial evidence, alongside the ongoing operation of spiritual gifts and fruit (Acts 2:4; Galatians 5:22-23).",
  },
  {
    title: "Divine Healing",
    body: "Healing for sickness and disease is provided in Christ's atonement — though the Church does not oppose medical treatment (Isaiah 53:4-5; James 5:14-16).",
  },
  {
    title: "Tithes and Offerings",
    body: "We give tithes and freewill offerings cheerfully toward the work of God's Kingdom (Malachi 3:10; 2 Corinthians 9:7).",
  },
  {
    title: "The Second Coming and the Next Life",
    body: "Christ will return, and the dead will be raised — the saved to eternal life, the unsaved to judgment (Acts 1:11; Romans 6:23).",
  },
  {
    title: "Marriage and Family Life",
    body: "Marriage is a lifelong union of one man and one woman, ordained by God for companionship and for raising children in godly, responsible living (Genesis 2:18; Matthew 19:4-6).",
  },
];

export const TENETS_OUTRO =
  "These tenets are expanded in our book, The Tenets of The Church of Pentecost, available from our online store.";
