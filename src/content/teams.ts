import type { TeamProfile } from "./types";

const SOURCE = "Pitwall Archive editorial; statistics computed from Jolpica-F1";
const REVIEWED = "2026-10-11";

/**
 * Profiled teams. The `key` matches PROFILED_TEAMS in scripts/config.ts.
 * Statistics (wins, titles, entries…) are never written here — they are computed.
 */
export const TEAM_PROFILES: TeamProfile[] = [
  {
    key: "ferrari",
    slug: "ferrari",
    name: "Ferrari",
    fullName: "Scuderia Ferrari",
    nationality: "Italian",
    base: "Maranello, Italy",
    status: "Active",
    years: "1950–present",
    color: "#D40000",
    lineageNode: "ferrari",
    summary:
      "The only team to have contested every season of the World Championship. Enzo Ferrari's Scuderia began as Alfa Romeo's racing arm in 1929 and built its own cars after the war. Its history is the backbone of Formula 1 itself.",
    chapters: [
      {
        era: "1950s",
        title: "From Alfa Romeo's shadow to champions",
        body: [
          "Ferrari skipped the very first championship race at Silverstone in 1950 and made its debut a week later at [[c:monaco|Monaco]]. Its first victory came at the 1951 British Grand Prix, when José Froilán González beat the previously dominant Alfa Romeos. Enzo Ferrari later said he felt he had killed his mother.",
          "With the championship run to Formula 2 rules in 1952 and 1953, Alberto Ascari won back-to-back titles in the Aurelio Lampredi-designed 500. [[d:fangio]] added a title in 1956 with the Lancia-derived cars, and Mike Hawthorn won by a single point in 1958.",
        ],
      },
      {
        era: "1960s–1970s",
        title: "Sharknoses, flat-12s and Lauda",
        body: [
          "The mid-engined 156 'Sharknose' gave Phil Hill the 1961 title, a season overshadowed by the death of his teammate Wolfgang von Trips at Monza. John Surtees, already a motorcycle world champion, won in 1964.",
          "After a lean spell, Mauro Forghieri's transverse-gearbox 312T turned Ferrari into the class of the field. [[d:lauda]] won the title in 1975 and again in 1977, the year after his near-fatal crash at the [[c:nurburgring|Nürburgring]]. Jody Scheckter added another in 1979.",
        ],
      },
      {
        era: "1980s–1990s",
        title: "Turbos, tragedy and a long wait",
        body: [
          "Ferrari's turbo cars won the constructors' title in 1982 and 1983, but 1982 also brought the death of Gilles Villeneuve in qualifying at Zolder and the career-ending accident of Didier Pironi. Enzo Ferrari died in August 1988. Weeks later his team scored an emotional one-two at [[c:monza|Monza]], the only race of [[s:1988]] that McLaren did not win.",
          "The rebuild of the 1990s under Jean Todt brought [[d:michael_schumacher]] from Benetton in 1996, followed by technical director Ross Brawn and designer Rory Byrne.",
        ],
      },
      {
        era: "2000s–present",
        title: "The Schumacher era and after",
        body: [
          "From 2000 to 2004 Schumacher won five consecutive drivers' titles, and Ferrari took six consecutive constructors' titles from 1999. Kimi Räikkönen won the 2007 title by a single point, and Ferrari took the 2008 constructors' crown.",
          "Since then Ferrari has won races with [[d:alonso]], Sebastian Vettel, Charles Leclerc and Carlos Sainz, but has not won another title. [[d:hamilton]] joined in 2025.",
        ],
      },
    ],
    cars: [
      { season: "1951", chassis: "375", engine: "Ferrari 4.5 V12", designers: "Aurelio Lampredi", note: "Gave Ferrari its first championship win at Silverstone." },
      { season: "1952–1953", chassis: "500", engine: "Ferrari 2.0 inline-4", designers: "Aurelio Lampredi", note: "Ascari's two championships under Formula 2 rules." },
      { season: "1961", chassis: "156 'Sharknose'", engine: "Ferrari 1.5 V6", designers: "Carlo Chiti", note: "Phil Hill's title car, built for the new 1.5-litre formula." },
      { season: "1975–1980", chassis: "312T series", engine: "Ferrari 3.0 flat-12", designers: "Mauro Forghieri", note: "Transverse gearbox. Titles for Lauda (1975, 1977) and Scheckter (1979)." },
      { season: "1982", chassis: "126C2", engine: "Ferrari 1.5 V6 turbo", designers: "Harvey Postlethwaite", note: "Ferrari's first championship-winning turbo car (constructors')." },
      { season: "2004", chassis: "F2004", engine: "Ferrari 3.0 V10", designers: "Rory Byrne, Ross Brawn", note: "Peak of the Schumacher era." },
    ],
    source: SOURCE,
    lastReviewed: REVIEWED,
  },
  {
    key: "mclaren",
    slug: "mclaren",
    name: "McLaren",
    fullName: "McLaren Racing",
    nationality: "British",
    base: "Woking, United Kingdom",
    status: "Active",
    years: "1966–present",
    color: "#FF8000",
    lineageNode: "mclaren",
    summary:
      "Founded by New Zealander Bruce McLaren in 1963, McLaren raced its first Grand Prix at Monaco in 1966. It has since become one of the sport's most successful teams, through eras defined by Ron Dennis, Honda power, and a modern revival.",
    chapters: [
      {
        era: "1960s–1970s",
        title: "Bruce's team",
        body: [
          "Bruce McLaren gave his team its first win at the 1968 Belgian Grand Prix. He was killed testing a Can-Am car at Goodwood in June 1970, and Teddy Mayer led the team on.",
          "The long-lived M23 won Emerson Fittipaldi the 1974 title and McLaren its first constructors' championship. In [[s:1976]], [[d:hunt]] took the drivers' title in the same car after a season-long duel with [[d:lauda]].",
        ],
      },
      {
        era: "1980s",
        title: "Carbon fibre and Ron Dennis",
        body: [
          "A 1980 merger with Ron Dennis's Project Four brought designer John Barnard, whose MP4/1 of 1981 introduced the carbon-fibre composite monocoque. TAG-Porsche turbo power then delivered titles for Lauda (1984) and [[d:prost]] (1985, 1986).",
          "With Honda engines and [[d:senna]] alongside Prost, the MP4/4 won 15 of 16 races in [[s:1988]]. Senna and Prost's rivalry turned bitter, and their 1989 collision at [[c:suzuka|Suzuka]] decided that year's title in Prost's favour.",
        ],
      },
      {
        era: "1990s–2000s",
        title: "Senna, Häkkinen, Hamilton",
        body: [
          "Senna won further titles in 1990 and 1991. After lean years, an Adrian Newey-designed, Mercedes-powered McLaren carried Mika Häkkinen to championships in 1998 and 1999.",
          "In 2007 rookie [[d:hamilton]] lost the title by a single point in a season marred by the espionage case that saw McLaren excluded from the constructors' standings. A year later he won the championship at the final corner in Brazil.",
        ],
      },
      {
        era: "2010s–present",
        title: "Collapse and revival",
        body: [
          "A difficult Honda reunion from 2015 to 2017 left McLaren near the back. A rebuild under Zak Brown and, later, team principal Andrea Stella returned the team to winning form. McLaren won the 2024 constructors' title, its first since 1998, and repeated it in 2025.",
        ],
      },
    ],
    cars: [
      { season: "1973–1977", chassis: "M23", engine: "Ford Cosworth DFV", designers: "Gordon Coppuck", note: "Titles for Fittipaldi (1974) and Hunt (1976)." },
      { season: "1981", chassis: "MP4/1", engine: "Ford Cosworth DFV", designers: "John Barnard", note: "First carbon-fibre composite monocoque in F1." },
      { season: "1984", chassis: "MP4/2", engine: "TAG-Porsche 1.5 V6 turbo", designers: "John Barnard", note: "Lauda beat Prost to the title by half a point." },
      { season: "1988", chassis: "MP4/4", engine: "Honda 1.5 V6 turbo", designers: "Steve Nichols, Gordon Murray", note: "Won 15 of the season's 16 races." },
      { season: "1998", chassis: "MP4-13", engine: "Mercedes 3.0 V10", designers: "Adrian Newey", note: "Häkkinen's first title." },
    ],
    source: SOURCE,
    lastReviewed: REVIEWED,
  },
  {
    key: "mercedes",
    slug: "mercedes",
    name: "Mercedes",
    fullName: "Mercedes-AMG Petronas F1 Team",
    nationality: "German",
    base: "Brackley, United Kingdom",
    status: "Active",
    years: "1954–1955, 2010–present",
    color: "#00A19C",
    lineageNode: "mercedes",
    summary:
      "Mercedes-Benz raced as a works team in 1954 and 1955 and won both championships with Fangio. It returned in 2010 by buying the title-winning Brawn team, and that Brackley outfit, the old Tyrrell squad's descendant, dominated the turbo-hybrid era.",
    chapters: [
      {
        era: "1950s",
        title: "The Silver Arrows return",
        body: [
          "The W196 arrived mid-way through 1954 and won on debut at Reims. [[d:fangio]], who had started the year with Maserati, won the 1954 and 1955 titles. Stirling Moss won the 1955 British Grand Prix at Aintree.",
          "After the 1955 Le Mans disaster, in which a Mercedes crashed into the crowd, the company withdrew from motor racing at the end of the year.",
        ],
      },
      {
        era: "2010–2013",
        title: "Rebuilding at Brackley",
        body: [
          "Mercedes bought the [[t:brawn|Brawn]] team after its [[s:2009]] double title. [[d:michael_schumacher]] came out of retirement to partner Nico Rosberg. Rosberg's 2012 win in China was the team's first, and [[d:hamilton]] arrived from McLaren in 2013.",
        ],
      },
      {
        era: "2014–2021",
        title: "The hybrid dynasty",
        body: [
          "Mercedes' preparation for the 2014 V6 turbo-hybrid rules produced one of the most dominant runs in the sport's history: eight consecutive constructors' titles from 2014 to 2021. Hamilton won six drivers' titles in that span, and Rosberg won in 2016 before retiring days later.",
          "The streak of drivers' titles ended at the controversial [[s:2021]] finale in Abu Dhabi, where [[d:max_verstappen]] passed Hamilton on the final lap.",
        ],
      },
      {
        era: "2022–present",
        title: "Ground effect and a new generation",
        body: [
          "The 2022 ground-effect rules caught Mercedes out, though George Russell won in Brazil that year. Hamilton left for Ferrari after 2024, and Andrea Kimi Antonelli joined Russell for 2025.",
        ],
      },
    ],
    cars: [
      { season: "1954–1955", chassis: "W196", engine: "Mercedes-Benz 2.5 straight-8", designers: "Rudolf Uhlenhaut and team", note: "Raced in both streamlined and open-wheel bodywork." },
      { season: "2014", chassis: "F1 W05 Hybrid", engine: "Mercedes 1.6 V6 turbo-hybrid", note: "Opened the hybrid era with 16 wins from 19 races." },
      { season: "2020", chassis: "F1 W11", engine: "Mercedes 1.6 V6 turbo-hybrid", note: "Ran the DAS dual-axis steering system." },
    ],
    source: SOURCE,
    lastReviewed: REVIEWED,
  },
  {
    key: "red_bull",
    slug: "red-bull",
    name: "Red Bull",
    fullName: "Red Bull Racing",
    nationality: "Austrian",
    base: "Milton Keynes, United Kingdom",
    status: "Active",
    years: "2005–present",
    color: "#3671C6",
    lineageNode: "red_bull",
    summary:
      "Red Bull bought the Jaguar team, itself the former Stewart Grand Prix, at the end of 2004. With Adrian Newey's designs it became a four-time champion with Sebastian Vettel and then the dominant force of the early ground-effect era with Max Verstappen.",
    chapters: [
      {
        era: "2005–2009",
        title: "From party team to contender",
        body: [
          "Red Bull's early seasons were known for paddock hospitality more than results, but the arrival of Adrian Newey in 2006 changed the team. Sebastian Vettel gave Red Bull its first win in China in [[s:2009]], and the team finished that season as Brawn's closest challenger.",
        ],
      },
      {
        era: "2010–2013",
        title: "The Vettel years",
        body: [
          "Exhaust-blown diffusers and Renault power carried Vettel to four consecutive drivers' titles, and Red Bull won the constructors' championship each year from 2010 to 2013.",
        ],
      },
      {
        era: "2014–2020",
        title: "Hybrid frustration",
        body: [
          "The Renault hybrid power unit could not match Mercedes. Daniel Ricciardo won three races in 2014, and [[d:max_verstappen]], promoted from Toro Rosso, won on his Red Bull debut in Spain in 2016. Honda engines arrived in 2019.",
        ],
      },
      {
        era: "2021–present",
        title: "Verstappen's era",
        body: [
          "Verstappen beat [[d:hamilton]] to the [[s:2021]] title at the final race. He added titles in 2022, 2023 and 2024. In 2023 the RB19 won 21 of 22 races.",
        ],
      },
    ],
    cars: [
      { season: "2010", chassis: "RB6", engine: "Renault 2.4 V8", designers: "Adrian Newey", note: "Vettel's first title." },
      { season: "2013", chassis: "RB9", engine: "Renault 2.4 V8", designers: "Adrian Newey", note: "Vettel won the last nine races of the season." },
      { season: "2023", chassis: "RB19", engine: "Honda RBPT 1.6 V6 turbo-hybrid", designers: "Adrian Newey, Pierre Waché", note: "Won 21 of 22 Grands Prix." },
    ],
    source: SOURCE,
    lastReviewed: REVIEWED,
  },
  {
    key: "williams",
    slug: "williams",
    name: "Williams",
    fullName: "Williams Racing",
    nationality: "British",
    base: "Grove, United Kingdom",
    status: "Active",
    years: "1977–present",
    color: "#005AFF",
    lineageNode: "williams",
    summary:
      "Frank Williams and engineer Patrick Head founded Williams Grand Prix Engineering in 1977. For two decades it was the benchmark of British engineering, winning nine constructors' championships between 1980 and 1997.",
    chapters: [
      {
        era: "1977–1980s",
        title: "Grove's golden age begins",
        body: [
          "Clay Regazzoni gave Williams its first win at the 1979 British Grand Prix. Alan Jones won the 1980 title, and Keke Rosberg won in 1982.",
          "With Honda turbo power the FW11 won the 1986 constructors' title. Frank Williams had been paralysed in a road accident in France that March. [[d:mansell]] and Nelson Piquet fought each other for the 1986 and 1987 crowns. Piquet won the 1987 title.",
        ],
      },
      {
        era: "1990s",
        title: "Active suspension and Newey",
        body: [
          "With Renault V10s and Adrian Newey working under Head, the active-suspension FW14B carried Mansell to the 1992 title. [[d:prost]] won in 1993 and retired.",
          "[[d:senna]] was killed at Imola in 1994 driving the FW16. Damon Hill (1996) and Jacques Villeneuve (1997) added titles before Newey's departure and Renault's withdrawal ended the era.",
        ],
      },
      {
        era: "2000s–present",
        title: "Independence and new ownership",
        body: [
          "BMW-powered Williams won races in the early 2000s, and Pastor Maldonado's 2012 Spanish Grand Prix win stands as the team's most recent. The Williams family sold the team to Dorilton Capital in 2020, and Frank Williams died in 2021. James Vowles has led the team since 2023.",
        ],
      },
    ],
    cars: [
      { season: "1979–1981", chassis: "FW07", engine: "Ford Cosworth DFV", designers: "Patrick Head", note: "Ground-effect car that brought the first titles." },
      { season: "1986", chassis: "FW11", engine: "Honda 1.5 V6 turbo", designers: "Patrick Head", note: "Constructors' champion, 9 wins." },
      { season: "1992", chassis: "FW14B", engine: "Renault 3.5 V10", designers: "Patrick Head, Adrian Newey", note: "Active suspension and Mansell's title." },
      { season: "1996", chassis: "FW18", engine: "Renault 3.0 V10", designers: "Adrian Newey, Patrick Head", note: "Damon Hill's title car." },
    ],
    source: SOURCE,
    lastReviewed: REVIEWED,
  },
  {
    key: "brabham",
    slug: "brabham",
    name: "Brabham",
    fullName: "Motor Racing Developments (Brabham)",
    nationality: "British",
    base: "Chessington, United Kingdom",
    status: "Defunct",
    years: "1962–1992",
    color: "#2B5BA8",
    lineageNode: "brabham",
    summary:
      "Jack Brabham and designer Ron Tauranac built cars under the Motor Racing Developments name. Brabham remains the only driver to win a world title in a car bearing his own name. Under Bernie Ecclestone and Gordon Murray the team became one of F1's great innovators.",
    chapters: [
      {
        era: "1960s",
        title: "A champion's own car",
        body: [
          "Brabham's cars first raced in 1962. Dan Gurney gave the marque its first win in France in 1964. In 1966 the Repco-engined BT19 and BT20 carried Jack Brabham to his third title, and Denny Hulme won in 1967. Brabham took the constructors' championship both years.",
        ],
      },
      {
        era: "1970s",
        title: "Ecclestone and Murray",
        body: [
          "Bernie Ecclestone bought the team in the early 1970s and handed design to Gordon Murray. His BT44 won races for Carlos Reutemann and Carlos Pace. In 1978 the BT46B 'fan car' won the Swedish Grand Prix with [[d:lauda]] and was then withdrawn.",
        ],
      },
      {
        era: "1980s",
        title: "Piquet's titles",
        body: [
          "Nelson Piquet won the 1981 title in the BT49. In 1983 he won again in the BMW-powered BT52, the first drivers' title for a turbocharged car. Murray left for McLaren after 1986, and the team skipped 1988 after Ecclestone sold it.",
        ],
      },
      {
        era: "1989–1992",
        title: "Decline",
        body: [
          "Brabham returned under new owners in 1989 but never recovered its form. It collapsed during the 1992 season, and Damon Hill drove its final race in Hungary.",
        ],
      },
    ],
    cars: [
      { season: "1966", chassis: "BT19 / BT20", engine: "Repco 3.0 V8", designers: "Ron Tauranac", note: "Jack Brabham's title in his own car." },
      { season: "1974–1975", chassis: "BT44", engine: "Ford Cosworth DFV", designers: "Gordon Murray", note: "Triangular-section monocoque. Race winner for Reutemann and Pace." },
      { season: "1978", chassis: "BT46B", engine: "Alfa Romeo flat-12", designers: "Gordon Murray", note: "The 'fan car': won its only race and was withdrawn." },
      { season: "1981", chassis: "BT49", engine: "Ford Cosworth DFV", designers: "Gordon Murray", note: "Piquet's first title." },
      { season: "1983", chassis: "BT52", engine: "BMW 1.5 inline-4 turbo", designers: "Gordon Murray", note: "First turbo-powered drivers' champion." },
    ],
    source: SOURCE,
    lastReviewed: REVIEWED,
  },
  {
    key: "lotus",
    slug: "lotus",
    name: "Lotus",
    fullName: "Team Lotus",
    nationality: "British",
    base: "Hethel, United Kingdom",
    status: "Defunct",
    years: "1958–1994",
    color: "#1C5A3C",
    lineageNode: "lotus",
    summary:
      "Colin Chapman's Team Lotus was Formula 1's great laboratory. It brought the monocoque chassis, the stressed engine, sponsor liveries, the wedge shape and ground effect. The archive counts every Lotus chassis, including privateer entries such as Rob Walker's.",
    chapters: [
      {
        era: "1958–1960s",
        title: "Chapman's revolution",
        body: [
          "Lotus entered F1 in 1958. Stirling Moss scored the marque's first win at [[c:monaco|Monaco]] in 1960 in Rob Walker's privately run Lotus 18. The monocoque Lotus 25 carried [[d:clark]] to the 1963 title, and he won again in 1965.",
          "The Lotus 49 of 1967 used the new Cosworth DFV as a stressed member of the chassis, a layout that became standard. Clark was killed at Hockenheim in a Formula 2 race in April 1968. Graham Hill won that year's title for the grieving team, which had just introduced wings and the Gold Leaf sponsor livery.",
        ],
      },
      {
        era: "1970s",
        title: "Wedges and wings",
        body: [
          "Jochen Rindt was killed in practice at [[c:monza|Monza]] in 1970 and became the sport's only posthumous champion, in the wedge-shaped Lotus 72. Emerson Fittipaldi won the 1972 title in the same design.",
          "The Lotus 78 and 79 pioneered ground effect, shaping the underside of the car to suck it to the road. Mario Andretti won the 1978 championship, a season darkened by the death of his teammate Ronnie Peterson after a crash at Monza.",
        ],
      },
      {
        era: "1980s–1994",
        title: "After Chapman",
        body: [
          "Chapman died in December 1982. [[d:senna]] won his first Grand Prix for Lotus in Portugal in 1985 and five more races before leaving for McLaren after 1987. The team faded and closed after the 1994 season.",
          "Later teams named Lotus Racing (2010–2011) and Lotus F1 (2012–2015) used the name but were unrelated organisations.",
        ],
      },
    ],
    cars: [
      { season: "1962–1965", chassis: "25 / 33", engine: "Coventry Climax 1.5 V8", designers: "Colin Chapman", note: "Monocoque chassis. Clark's 1963 and 1965 titles." },
      { season: "1967–1970", chassis: "49", engine: "Ford Cosworth DFV", designers: "Colin Chapman, Maurice Philippe", note: "Engine as a stressed member. Won on debut at Zandvoort." },
      { season: "1970–1975", chassis: "72", engine: "Ford Cosworth DFV", designers: "Colin Chapman, Maurice Philippe", note: "Wedge profile, side radiators. Titles for Rindt and Fittipaldi." },
      { season: "1978", chassis: "79", engine: "Ford Cosworth DFV", designers: "Colin Chapman, Peter Wright, Tony Rudd", note: "Full ground effect. Andretti's title." },
      { season: "1987", chassis: "99T", engine: "Honda 1.5 V6 turbo", designers: "Gérard Ducarouge", note: "Active suspension. Senna won at Monaco and Detroit." },
    ],
    source: SOURCE,
    lastReviewed: REVIEWED,
  },
  {
    key: "tyrrell",
    slug: "tyrrell",
    name: "Tyrrell",
    fullName: "Tyrrell Racing Organisation",
    nationality: "British",
    base: "Ockham, Surrey, United Kingdom",
    status: "Defunct",
    years: "1970–1998",
    color: "#0A3D91",
    lineageNode: "tyrrell",
    summary:
      "Ken Tyrrell ran a timber business and a Formula Junior team before becoming a constructor in 1970. With Jackie Stewart his team won titles, and the six-wheeled P34 made it unforgettable. Its entry passed to BAR, the start of a lineage that runs to Mercedes.",
    chapters: [
      {
        era: "1968–1973",
        title: "Stewart and the Tyrrells",
        body: [
          "Tyrrell first ran Matra chassis, with which [[d:stewart]] won the 1969 title. Unwilling to switch to Matra's V12, Tyrrell commissioned its own car from Derek Gardner. Stewart won the 1971 title in the Tyrrell 003, and Tyrrell took the constructors' championship. He won again in 1973.",
          "Stewart retired at the end of 1973. His teammate and protégé François Cevert was killed in qualifying at Watkins Glen, and Stewart withdrew from what would have been his 100th Grand Prix.",
        ],
      },
      {
        era: "1974–1983",
        title: "Six wheels and the last DFV win",
        body: [
          "Gardner's P34, with four small front wheels, finished first and second at the 1976 Swedish Grand Prix with Jody Scheckter leading Patrick Depailler. Michele Alboreto's win in Detroit in 1983 was Tyrrell's last, and the final win for the Cosworth DFV.",
        ],
      },
      {
        era: "1984–1998",
        title: "Survival",
        body: [
          "Tyrrell was excluded from the 1984 championship after a dispute over ballast and fuel. It remained a respected independent, giving early chances to Jean Alesi among others. British American Tobacco bought the team in 1997, and it became British American Racing in 1999.",
        ],
      },
    ],
    cars: [
      { season: "1971", chassis: "003", engine: "Ford Cosworth DFV", designers: "Derek Gardner", note: "Stewart's second title, Tyrrell's constructors' crown." },
      { season: "1976–1977", chassis: "P34", engine: "Ford Cosworth DFV", designers: "Derek Gardner", note: "Six-wheeler. One-two in Sweden in 1976." },
      { season: "1990", chassis: "019", engine: "Ford Cosworth DFR", designers: "Harvey Postlethwaite, Jean-Claude Migeot", note: "Introduced the raised 'anhedral' nose." },
    ],
    source: SOURCE,
    lastReviewed: REVIEWED,
  },
  {
    key: "jordan",
    slug: "jordan",
    name: "Jordan",
    fullName: "Jordan Grand Prix",
    nationality: "Irish",
    base: "Silverstone, United Kingdom",
    status: "Defunct",
    years: "1991–2005",
    color: "#E5B800",
    lineageNode: "jordan",
    summary:
      "Eddie Jordan's team arrived in 1991 with a beautiful green car and a habit of spotting talent. It won four Grands Prix before being sold in 2005, and its Silverstone base lives on through Force India and Racing Point to today's Aston Martin.",
    chapters: [
      {
        era: "1991–1997",
        title: "A dazzling debut",
        body: [
          "The Gary Anderson-designed Jordan 191 was the surprise of 1991. At Spa that August, [[d:michael_schumacher]] made his Grand Prix debut in it before Benetton signed him away. Rubens Barrichello took Jordan's first pole at Spa in 1994.",
        ],
      },
      {
        era: "1998–2003",
        title: "Winning years",
        body: [
          "Damon Hill led Ralf Schumacher home in a one-two at a rain-soaked Belgian Grand Prix in 1998. Heinz-Harald Frentzen won twice in 1999 and kept Jordan in the title conversation until late in the season. Jordan finished third in the constructors' championship.",
          "Giancarlo Fisichella won the chaotic, red-flagged 2003 Brazilian Grand Prix, awarded to him days later after a timing review. It was the team's fourth and final victory.",
        ],
      },
      {
        era: "2004–2005",
        title: "Sale",
        body: [
          "Short of money, Eddie Jordan sold the team to the Midland Group, and 2005 was the last season under the Jordan name.",
        ],
      },
    ],
    cars: [
      { season: "1991", chassis: "191", engine: "Ford HB V8", designers: "Gary Anderson", note: "Debut car, fifth in the constructors' championship." },
      { season: "1998", chassis: "198", engine: "Mugen-Honda V10", designers: "Mike Gascoyne", note: "First win: Spa, 1–2." },
      { season: "1999", chassis: "199", engine: "Mugen-Honda V10", designers: "Mike Gascoyne", note: "Two Frentzen wins, third overall." },
    ],
    source: SOURCE,
    lastReviewed: REVIEWED,
  },
  {
    key: "brawn",
    slug: "brawn-gp",
    name: "Brawn GP",
    fullName: "Brawn GP Formula One Team",
    nationality: "British",
    base: "Brackley, United Kingdom",
    status: "Defunct",
    years: "2009",
    color: "#9BB300",
    lineageNode: "brawn",
    summary:
      "Brawn GP raced for one season and won both championships. Honda's sudden withdrawal in December 2008 left the Brackley team without an owner. Ross Brawn led a management buyout, fitted Mercedes engines, and Jenson Button won six of the first seven races.",
    chapters: [
      {
        era: "2009",
        title: "One season, two titles",
        body: [
          "Honda had spent heavily on its 2009 car. When Honda pulled out, Ross Brawn and Nick Fry bought the team and squeezed a Mercedes engine into the chassis weeks before the season. The BGP 001's double diffuser was protested by rivals, but the FIA's appeal court declared it legal in April.",
          "[[d:button]] won six of the first seven races. As Red Bull developed faster, Brawn's early lead carried it through, and both titles were clinched in Brazil. Rubens Barrichello added wins in Valencia and Monza.",
          "Mercedes bought the team at the end of the season, and it raced in 2010 as Mercedes GP.",
        ],
      },
    ],
    cars: [
      { season: "2009", chassis: "BGP 001", engine: "Mercedes 2.4 V8", designers: "The former Honda technical team", note: "Double diffuser. Eight wins and both titles." },
    ],
    source: SOURCE,
    lastReviewed: REVIEWED,
  },
];

export const teamProfile = (key: string) => TEAM_PROFILES.find((t) => t.key === key);
