import type { SeasonEditorial } from "./types";

const SOURCE = "Pitwall Archive editorial; results and standings from Jolpica-F1";
const REVIEWED = "2026-10-11";

export const SEASON_EDITORIALS: SeasonEditorial[] = [
  {
    year: 1976,
    headline: "Hunt against Lauda, decided by a point in the rain at Fuji.",
    regulations: [
      "Tall engine airboxes banned from the Spanish Grand Prix onwards.",
      "New limits on overall car width and rear overhang introduced at the same race.",
    ],
    story: [
      "[[d:lauda]] arrived as reigning champion in the Ferrari 312T and won four of the first six races. His closest challenger turned out to be [[d:hunt]], drafted into [[t:mclaren|McLaren]] at the last moment to replace Emerson Fittipaldi.",
      "The season was fought in the stewards' rooms as much as on track. Hunt won in Spain, was disqualified because his car was 1.8 cm too wide, and was reinstated on appeal in July. At Brands Hatch he won a restarted British Grand Prix in front of his home crowd, only for Ferrari's protest to strip him of the victory in September.",
      "On 1 August Lauda crashed on the second lap at the [[c:nurburgring|Nürburgring]] and was trapped in his burning Ferrari. While he fought for his life, Hunt closed the gap with wins in Germany, the Netherlands, Canada and the United States. Lauda returned at [[c:monza|Monza]] six weeks after the accident and finished fourth.",
      "The decider at Fuji was run in torrential rain. Lauda pulled into the pits after two laps, judging the conditions too dangerous. Hunt, delayed by a late tyre stop, finished third and won the title by one point. Ferrari took the constructors' championship.",
    ],
    moments: [
      { race: "Brazilian", kind: "milestone", title: "Lauda opens his defence", text: "The champion wins the season opener at Interlagos." },
      { race: "Spanish", kind: "controversy", title: "Hunt disqualified, then reinstated", text: "Hunt's McLaren is found 1.8 cm too wide after he wins. The result is restored on appeal in July." },
      { race: "Swedish", kind: "milestone", title: "Six wheels, one-two", text: "Jody Scheckter and Patrick Depailler give the six-wheeled Tyrrell P34 its only win, a one-two." },
      { race: "British", kind: "controversy", title: "The Brands Hatch restart", text: "Hunt wins the restarted race. Ferrari's appeal later hands the victory to Lauda." },
      { race: "German", kind: "crash", title: "Lauda's crash at the Nürburgring", text: "Lauda is badly burned in a second-lap crash. Other drivers pull him from the car." },
      { race: "Austrian", kind: "milestone", title: "Watson wins for Penske", text: "John Watson scores his first win and the Penske team's only Grand Prix victory." },
      { race: "Italian", kind: "milestone", title: "Lauda returns", text: "Six weeks after his accident, Lauda finishes fourth at Monza." },
      { race: "Japanese", kind: "title", title: "Hunt champion by a point", text: "Lauda withdraws in the deluge. Hunt's third place is enough." },
    ],
    source: SOURCE,
    lastReviewed: REVIEWED,
  },
  {
    year: 1988,
    headline: "McLaren-Honda wins 15 of 16. Senna beats Prost to the title.",
    regulations: [
      "Final season of turbocharged engines: boost limited to 2.5 bar, fuel to 150 litres.",
      "Naturally aspirated 3.5-litre engines raced alongside, ahead of becoming mandatory in 1989.",
      "Drivers' feet required to sit behind the front axle line.",
    ],
    story: [
      "For the last year of the turbo era, [[t:mclaren|McLaren]] paired Honda's engine with the low-slung MP4/4 and a pair of world-class drivers: [[d:prost]] and the newly signed [[d:senna]]. The result was the most dominant season the sport had seen.",
      "Senna took 13 pole positions. He threw away a commanding lead at [[c:monaco|Monaco]] by crashing at Portier, and Prost inherited the win. Through the summer the two traded victories, and the relationship between them grew colder.",
      "The only race McLaren lost came at [[c:monza|Monza]], weeks after Enzo Ferrari's death. Senna, leading with two laps left, collided with Jean-Louis Schlesser's Williams while lapping it. Gerhard Berger and Michele Alboreto finished one-two for Ferrari.",
      "Only each driver's best 11 results counted. Prost outscored Senna overall, but Senna had the better best-11 total. At [[c:suzuka|Suzuka]] he stalled on the grid, dropped to 14th, and recovered to win the race and his first championship.",
    ],
    moments: [
      { race: "Brazilian", kind: "controversy", title: "Senna disqualified at home", text: "Senna switches to the spare car after the start was aborted, and is disqualified for it." },
      { race: "Monaco", kind: "crash", title: "Senna crashes from the lead", text: "Comfortably ahead, Senna hits the barrier at Portier. Prost wins." },
      { race: "Portuguese", kind: "controversy", title: "Squeezed at 300 km/h", text: "Senna squeezes Prost towards the pit wall at the start of lap two. Their relationship sours." },
      { when: "14 August", kind: "milestone", title: "Enzo Ferrari dies", text: "The founder of Ferrari dies aged 90." },
      { race: "Italian", kind: "milestone", title: "Ferrari's one-two at Monza", text: "Senna and Schlesser collide. The only race McLaren does not win." },
      { race: "Japanese", kind: "title", title: "Senna champion", text: "From a stalled start to victory and the title." },
      { race: "Australian", kind: "retirement", title: "The turbo era ends", text: "Prost wins the last race of the turbocharged era in Adelaide." },
    ],
    source: SOURCE,
    lastReviewed: REVIEWED,
  },
  {
    year: 2009,
    headline: "Brawn GP's fairy tale, and the rise of Red Bull.",
    regulations: [
      "Aerodynamic overhaul: wider, lower front wings, narrower, taller rear wings, and much of the bodywork furniture banned.",
      "Slick tyres return for the first time since 1997.",
      "Optional KERS energy-recovery systems allowed.",
    ],
    story: [
      "Honda withdrew from Formula 1 in December 2008, leaving its Brackley team weeks from closure. Ross Brawn bought it, fitted Mercedes engines, and arrived in Melbourne with [[t:brawn|Brawn GP]], a car that had barely tested and would soon prove the fastest in the field.",
      "The BGP 001, like the Toyota and Williams, exploited a double diffuser that rivals claimed was illegal. The FIA's appeal court disagreed in April. By then [[d:button]] had won twice, and he went on to win six of the first seven races.",
      "Red Bull, with Adrian Newey's RB5, became the faster car as the season wore on. Sebastian Vettel won the team's first race in China and Mark Webber took his first win at the [[c:nurburgring|Nürburgring]]. Brawn's lead was enough, and at [[c:interlagos|Interlagos]] Button climbed from 14th to fifth to clinch the title. Brawn won the constructors' championship in its only season.",
      "The year also brought Felipe Massa's serious head injury in Hungary, the revelation of Renault's 'Crashgate' race-fixing at Singapore in 2008, and the first race at Abu Dhabi's [[c:yas_marina|Yas Marina]].",
    ],
    moments: [
      { race: "Australian", kind: "debut", title: "Brawn's debut one-two", text: "Button leads Barrichello home on the team's first race." },
      { race: "Chinese", kind: "milestone", title: "Red Bull's first win", text: "Vettel leads a Red Bull one-two in the rain." },
      { race: "Turkish", kind: "milestone", title: "Six from seven", text: "Button's sixth win in seven races." },
      { race: "German", kind: "milestone", title: "Webber's first win", text: "Mark Webber wins at the Nürburgring despite a drive-through penalty." },
      { race: "Hungarian", kind: "crash", title: "Massa injured", text: "A spring from Barrichello's car strikes Massa's helmet in qualifying. Hamilton wins, the first victory for a KERS car." },
      { race: "Brazilian", kind: "title", title: "Button and Brawn are champions", text: "Fifth place from 14th on the grid secures both titles." },
      { race: "Abu Dhabi", kind: "debut", title: "Yas Marina's first race", text: "The season ends with the first day-to-night Grand Prix." },
    ],
    source: SOURCE,
    lastReviewed: REVIEWED,
  },
  {
    year: 2021,
    headline: "Verstappen against Hamilton, settled on the final lap.",
    regulations: [
      "Floor and diffuser trimmed to cut downforce after 2020.",
      "Budget cap introduced at US$145 million per team.",
      "Sprint qualifying trialled at Silverstone, Monza and Interlagos.",
    ],
    story: [
      "After seven straight Mercedes championships, Red Bull's RB16B and [[d:max_verstappen]] were finally a match for [[d:hamilton]] and [[t:mercedes|Mercedes]]. The two traded wins and the championship lead throughout a record 22-race season.",
      "The rivalry turned physical. At [[c:silverstone|Silverstone]] they collided at Copse on the first lap, sending Verstappen into the barrier at 51g, and Hamilton recovered to win. At [[c:monza|Monza]] Verstappen's car came to rest on top of Hamilton's, and the halo protected Hamilton's head.",
      "There were surprises too: Esteban Ocon's first win for Alpine in Hungary, Daniel Ricciardo leading a [[t:mclaren|McLaren]] one-two at Monza, and Hamilton's 100th victory in Russia. At [[c:spa|Spa]] the race ran for only a few laps behind the safety car in the rain, and half points were awarded.",
      "The two arrived in Abu Dhabi level on points. Hamilton led comfortably until a late safety car. Race control then allowed only the cars between the leaders to unlap themselves, which set up a one-lap shoot-out. Verstappen, on fresh tyres, passed Hamilton to win the race and the title. Mercedes won its eighth consecutive constructors' championship, and race director Michael Masi was replaced.",
    ],
    moments: [
      { race: "Bahrain", kind: "milestone", title: "Hamilton holds off Verstappen", text: "An opening win for Hamilton sets the tone for the year." },
      { race: "Monaco", kind: "milestone", title: "Verstappen leads the championship", text: "Verstappen's Monaco win puts him ahead in the standings for the first time in his career." },
      { race: "British", kind: "crash", title: "Copse", text: "Hamilton and Verstappen collide on lap one. Hamilton is penalised but wins." },
      { race: "Hungarian", kind: "milestone", title: "Ocon's first win", text: "A first-lap pile-up opens the door for Esteban Ocon and Alpine." },
      { race: "Belgian", kind: "controversy", title: "The race that wasn't", text: "Rain limits the race to laps behind the safety car. Half points are awarded." },
      { race: "Italian", kind: "crash", title: "Monza and the halo", text: "Both leaders retire after Verstappen's car lands on Hamilton's. Ricciardo wins." },
      { race: "Russian", kind: "milestone", title: "Hamilton's 100th win", text: "Late rain denies Lando Norris his first victory." },
      { race: "Abu Dhabi", kind: "title", title: "Final-lap decider", text: "After a contentious safety-car restart, Verstappen passes Hamilton to become champion." },
    ],
    source: SOURCE,
    lastReviewed: REVIEWED,
  },
];

export const seasonEditorial = (year: number) => SEASON_EDITORIALS.find((s) => s.year === year);
