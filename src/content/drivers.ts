import type { DriverProfile } from "./types";

const SOURCE = "Pitwall Archive editorial; statistics computed from Jolpica-F1";
const REVIEWED = "2026-10-11";

export const DRIVER_PROFILES: DriverProfile[] = [
  {
    id: "fangio",
    died: "1995-07-17",
    bio: [
      "Juan Manuel Fangio came to Europe from Balcarce, Argentina, in his late thirties. He became the measure against which every driver of the 1950s was judged. He won five world championships with four different manufacturers: Alfa Romeo, Mercedes-Benz, Ferrari and Maserati.",
      "His 1957 German Grand Prix at the [[c:nurburgring|Nürburgring]] is still cited as one of the greatest drives in history. After a slow pit stop left him nearly a minute behind the Ferraris of Mike Hawthorn and Peter Collins, he broke the lap record again and again and passed both to win and seal his fifth title.",
      "He retired in 1958 and later served as honorary president of Mercedes-Benz Argentina.",
    ],
    keyRaces: [
      { season: 1951, race: "Spanish", note: "Clinched his first title at Pedralbes with Alfa Romeo." },
      { season: 1954, race: "French", note: "Won on Mercedes' return to Grand Prix racing." },
      { season: 1957, race: "German", note: "Came back from almost a minute behind to win and take his fifth title." },
    ],
    milestones: ["Champion with four different manufacturers", "Five drivers' titles (1951, 1954–1957)"],
    source: SOURCE,
    lastReviewed: REVIEWED,
  },
  {
    id: "clark",
    died: "1968-04-07",
    bio: [
      "Jim Clark was a Scottish farmer whose smoothness made great drivers look clumsy. His partnership with Colin Chapman at [[t:lotus|Lotus]] produced the 1963 and 1965 world championships. In 1965 he also won the Indianapolis 500.",
      "In 1963 he won seven of the ten championship rounds. He might have won more titles but for mechanical failures, notably in the 1964 and 1967 seasons. He was killed in a Formula 2 race at Hockenheim in April 1968, aged 32. At the time he held the record for most Grand Prix wins.",
    ],
    keyRaces: [
      { season: 1962, race: "Belgian", note: "First championship win, at Spa." },
      { season: 1963, race: "Belgian", note: "Won at Spa in heavy rain by nearly five minutes." },
      { season: 1967, race: "Dutch", note: "Gave the Lotus 49 and the Cosworth DFV a debut win." },
    ],
    milestones: ["Two drivers' titles (1963, 1965)", "1965 Indianapolis 500 winner"],
    source: SOURCE,
    lastReviewed: REVIEWED,
  },
  {
    id: "stewart",
    bio: [
      "Sir Jackie Stewart won three world championships: 1969 with Matra, and 1971 and 1973 with [[t:tyrrell|Tyrrell]]. Off the track he changed the sport through his campaign for safety. After his crash at Spa in 1966, he pushed for barriers, medical facilities, full-face helmets and circuit inspections.",
      "He retired at the end of 1973, withdrawing from what would have been his 100th race after the death of his teammate François Cevert. He later founded Stewart Grand Prix with his son Paul. That team's entry became Jaguar and then today's [[t:red_bull|Red Bull]].",
    ],
    keyRaces: [
      { season: 1968, race: "German", note: "Won by four minutes in fog and rain at the Nürburgring." },
      { season: 1969, race: "Italian", note: "Clinched his first title in a four-car photo finish at Monza." },
      { season: 1971, race: "Spanish", note: "First win in a Tyrrell-built car." },
    ],
    milestones: ["Three drivers' titles (1969, 1971, 1973)", "Leading campaigner for driver and circuit safety"],
    source: SOURCE,
    lastReviewed: REVIEWED,
  },
  {
    id: "lauda",
    died: "2019-05-20",
    bio: [
      "Niki Lauda borrowed money to buy his way into Formula 1. He rebuilt his reputation at BRM and joined [[t:ferrari|Ferrari]] in 1974, winning the 1975 title with methodical precision.",
      "On 1 August 1976 he crashed at the [[c:nurburgring|Nürburgring]], and his car caught fire. He suffered severe burns and lung damage and was given the last rites. Six weeks later he raced again at Monza. He lost the [[s:1976]] title to [[d:hunt]] by one point after withdrawing from the rain-soaked finale in Japan, a decision he defended all his life.",
      "He won again in 1977, left Ferrari, and retired from Brabham in 1979 to run his airline. He returned with [[t:mclaren|McLaren]] in 1982 and won a third title in 1984 by half a point from teammate [[d:prost]]. He later became non-executive chairman of the Mercedes team during its hybrid-era dominance.",
    ],
    keyRaces: [
      { season: 1976, race: "Italian", note: "Finished fourth, six weeks after his near-fatal crash." },
      { season: 1978, race: "Swedish", note: "Won in the Brabham 'fan car', which then never raced again." },
      { season: 1984, race: "Portuguese", note: "Second place won him the title by half a point." },
    ],
    milestones: ["Three drivers' titles (1975, 1977, 1984)", "Champion with both Ferrari and McLaren"],
    source: SOURCE,
    lastReviewed: REVIEWED,
  },
  {
    id: "hunt",
    died: "1993-06-15",
    bio: [
      "James Hunt made his name with the privately funded Hesketh team. He gave it a famous win at Zandvoort in 1975. When Emerson Fittipaldi left [[t:mclaren|McLaren]] late that year, Hunt took his seat.",
      "His [[s:1976]] season had everything: a win taken away and restored in Spain, a disqualification from the British Grand Prix, and a late run of victories while [[d:lauda]] recovered from his burns. In the deluge at Fuji he finished third and won the championship by a single point.",
      "He retired in 1979 and became a much-loved BBC commentator alongside Murray Walker. He died of a heart attack in 1993, aged 45.",
    ],
    keyRaces: [
      { season: 1975, race: "Dutch", note: "Beat Lauda to give Hesketh its only win." },
      { season: 1976, race: "Japanese", note: "Third place in torrential rain won the title." },
      { season: 1977, race: "Japanese", note: "His final Grand Prix win." },
    ],
    milestones: ["1976 world champion"],
    source: SOURCE,
    lastReviewed: REVIEWED,
  },
  {
    id: "prost",
    bio: [
      "Alain Prost was nicknamed 'The Professor' for his calculating, economical style. He won four world championships: 1985, 1986 and 1989 with [[t:mclaren|McLaren]], and 1993 with [[t:williams|Williams]].",
      "His rivalry with [[d:senna]] defined the late 1980s. They were teammates at McLaren in [[s:1988]] and 1989, and their collisions at Suzuka decided two championships. Prost scored more points than Senna in 1988 but lost the title under the best-11-results rule.",
      "After a year out in 1992 he won the 1993 title with Williams and retired. He later ran his own team, Prost Grand Prix, from 1997 to 2001.",
    ],
    keyRaces: [
      { season: 1981, race: "French", note: "First Grand Prix win, at home for Renault." },
      { season: 1986, race: "Australian", note: "Won in Adelaide to take the title after Mansell's tyre failure." },
      { season: 1989, race: "Japanese", note: "Collided with Senna at the chicane and won the title." },
    ],
    milestones: ["Four drivers' titles (1985, 1986, 1989, 1993)"],
    source: SOURCE,
    lastReviewed: REVIEWED,
  },
  {
    id: "senna",
    died: "1994-05-01",
    bio: [
      "Ayrton Senna's qualifying speed, wet-weather skill and intensity made him the defining figure of his era. In his first season he nearly won at Monaco in 1984, driving a Toleman, before the race was stopped in the rain. He won his first race for [[t:lotus|Lotus]] in Portugal the following year, also in the rain.",
      "At [[t:mclaren|McLaren]] he won the [[s:1988]] title against teammate [[d:prost]], and further titles in 1990 and 1991. Their rivalry ended both the 1989 and 1990 championships with collisions at Suzuka.",
      "He moved to [[t:williams|Williams]] for 1994 and was killed at Imola on 1 May, a day after Roland Ratzenberger's fatal crash in qualifying. His death led to a sweeping overhaul of safety in Formula 1.",
    ],
    keyRaces: [
      { season: 1984, race: "Monaco", note: "Second in a Toleman when the rain-soaked race was stopped." },
      { season: 1985, race: "Portuguese", note: "First win, in torrential rain at Estoril." },
      { season: 1988, race: "Japanese", note: "Stalled at the start, recovered to win and take his first title." },
      { season: 1993, race: "European", note: "The famous first lap at a wet Donington Park." },
    ],
    milestones: ["Three drivers' titles (1988, 1990, 1991)", "Six wins at Monaco"],
    source: SOURCE,
    lastReviewed: REVIEWED,
  },
  {
    id: "mansell",
    bio: [
      "Nigel Mansell's career started with [[t:lotus|Lotus]] in 1980. His first win came only in his 72nd race, the 1985 European Grand Prix at Brands Hatch. At [[t:williams|Williams]] he lost the 1986 title when a tyre exploded in Adelaide, and the 1987 title to teammate Nelson Piquet.",
      "After two seasons at Ferrari he returned to Williams. In 1992, in the active-suspension FW14B, he won the first five races and the championship by mid-August. He moved to IndyCar for 1993 and won that series as a rookie.",
    ],
    keyRaces: [
      { season: 1985, race: "European", note: "First Grand Prix win at Brands Hatch." },
      { season: 1987, race: "British", note: "Chased down and passed Piquet at Stowe in the closing laps." },
      { season: 1992, race: "Hungarian", note: "Second place clinched the title." },
    ],
    milestones: ["1992 world champion", "1993 CART IndyCar champion as a rookie"],
    source: SOURCE,
    lastReviewed: REVIEWED,
  },
  {
    id: "michael_schumacher",
    bio: [
      "Michael Schumacher made his debut for [[t:jordan|Jordan]] at Spa in 1991 and moved to Benetton one race later. He won the 1994 and 1995 titles with Benetton. The 1994 title was decided by a controversial collision with Damon Hill in Adelaide.",
      "He joined [[t:ferrari|Ferrari]] in 1996. With Jean Todt, Ross Brawn and Rory Byrne he rebuilt the team, and from 2000 to 2004 he won five consecutive titles. His career had dark moments too, notably his exclusion from the 1997 championship for driving into Jacques Villeneuve.",
      "He retired after 2006, returned with [[t:mercedes|Mercedes]] from 2010 to 2012, and suffered a severe brain injury in a skiing accident in December 2013.",
    ],
    keyRaces: [
      { season: 1991, race: "Belgian", note: "Debut with Jordan. Qualified seventh." },
      { season: 1996, race: "Spanish", note: "First Ferrari win, in heavy rain." },
      { season: 2000, race: "Japanese", note: "Clinched Ferrari's first drivers' title since 1979." },
    ],
    milestones: ["Seven drivers' titles (1994, 1995, 2000–2004)"],
    source: SOURCE,
    lastReviewed: REVIEWED,
  },
  {
    id: "alonso",
    bio: [
      "Fernando Alonso debuted with Minardi in 2001. At Renault he ended [[d:michael_schumacher]]'s reign, winning the 2005 and 2006 championships. In 2005 he was then the youngest world champion.",
      "A tense 2007 at [[t:mclaren|McLaren]] alongside rookie [[d:hamilton]] was followed by five seasons at [[t:ferrari|Ferrari]], where he lost the 2010 and 2012 titles at the final race. Later spells with McLaren, Alpine and Aston Martin made him the driver with the most Grand Prix starts in history.",
    ],
    keyRaces: [
      { season: 2003, race: "Hungarian", note: "First win, then the youngest Grand Prix winner." },
      { season: 2005, race: "Brazilian", note: "Clinched his first title." },
      { season: 2012, race: "European", note: "Won from 11th on the grid in Valencia." },
    ],
    milestones: ["Two drivers' titles (2005, 2006)"],
    source: SOURCE,
    lastReviewed: REVIEWED,
  },
  {
    id: "button",
    bio: [
      "Jenson Button debuted with [[t:williams|Williams]] in 2000 aged 20. His first win came only in 2006, a rain-hit Hungarian Grand Prix for Honda.",
      "When Honda withdrew, Ross Brawn's buyout gave him the [[t:brawn|Brawn]] BGP 001. Button won six of the first seven races of [[s:2009]] and the title. At [[t:mclaren|McLaren]] he won the chaotic 2011 Canadian Grand Prix after falling to last.",
    ],
    keyRaces: [
      { season: 2006, race: "Hungarian", note: "First win, from 14th on the grid." },
      { season: 2009, race: "Brazilian", note: "Climbed from 14th to 5th to clinch the title." },
      { season: 2011, race: "Canadian", note: "Won after six pit stops and a lap in last place." },
    ],
    milestones: ["2009 world champion"],
    source: SOURCE,
    lastReviewed: REVIEWED,
  },
  {
    id: "hamilton",
    bio: [
      "Lewis Hamilton finished on the podium in his first Grand Prix in 2007 and missed the title by one point that year as a [[t:mclaren|McLaren]] rookie. He won the championship in 2008.",
      "His move to [[t:mercedes|Mercedes]] in 2013 coincided with the hybrid era. He won six titles there (2014, 2015, 2017–2020), equalling [[d:michael_schumacher]]'s seven in total, and set new marks for wins and pole positions. He lost the [[s:2021]] title to [[d:max_verstappen]] on the final lap of the season.",
      "He joined [[t:ferrari|Ferrari]] for 2025. Off track he has campaigned for diversity in motorsport.",
    ],
    keyRaces: [
      { season: 2007, race: "Canadian", note: "First win, in his sixth race." },
      { season: 2008, race: "British", note: "Won by over a minute in the wet." },
      { season: 2020, race: "Portuguese", note: "Record-breaking 92nd Grand Prix win." },
    ],
    milestones: ["Seven drivers' titles (2008, 2014, 2015, 2017–2020)"],
    source: SOURCE,
    lastReviewed: REVIEWED,
  },
  {
    id: "max_verstappen",
    bio: [
      "Max Verstappen, son of former F1 driver Jos Verstappen, debuted with Toro Rosso in 2015 aged 17. Promoted to [[t:red_bull|Red Bull]] four races into 2016, he won on his first race for the team in Spain, the youngest Grand Prix winner in history.",
      "He won the [[s:2021]] title after a season-long fight with [[d:hamilton]], decided on the final lap in Abu Dhabi. Titles in 2022, 2023 and 2024 followed. In 2023 he won 19 of 22 races.",
    ],
    keyRaces: [
      { season: 2016, race: "Spanish", note: "Won on his Red Bull debut, aged 18." },
      { season: 2021, race: "Abu Dhabi", note: "Final-lap pass on Hamilton for his first title." },
      { season: 2024, race: "Paulo", note: "Won from 17th on the grid in the wet." },
    ],
    milestones: ["Four drivers' titles (2021–2024)", "Youngest Grand Prix winner (18 years, 228 days)"],
    source: SOURCE,
    lastReviewed: REVIEWED,
  },
];

export const driverProfile = (id: string) => DRIVER_PROFILES.find((d) => d.id === id);
