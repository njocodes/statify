import type { Genre } from "./themes";

// The Spotify export has no genre field, so a hand-curated artist list is the genre source.
// Names are matched after normalize() (lowercase, no diacritics/punctuation).
const LISTS: Record<Genre, string> = {
  rap: `deichkind;samy deluxe;beginner;dendemann;kitschkrieg;raportagen;og keemo;souly;tom hengst;ivo der bandit;fatoni;marteria;marsimoto;casper;cro;capital bra;bushido;sido;kollegah;farid bang;haftbefehl;rin;apache 207;ufo361;bonez mc;187 strassenbande;gzuz;lx;kontra k;money boy;fler;shindy;kool savas;eko fresh;fettes brot;die fantastischen vier;moop mama;antilopen gang;prinz pi;edgar wasser;disarstar;chefket;haiyti;yung hurn;trettmann;nimo;luciano;ski aggu;kaptn peng;dame;retrogott;hulk hodn;morlockk dilemma;genetikk;alligatoah;bausa;mc fitti;ssio;celo abdi;azet;zuna;samra;leon machere;jamule;lune;badmomzjay;ennio;sdp;k.i.z;kiz;torch;curse;afrob;blumentopf;freundeskreis;clueso;peter fox;jan delay;disko no 1;absolute beginner;mono nikitaman;eminem;kendrick lamar;drake;j cole;travis scott;kanye west;ye;jay z;lil dicky;nf;tyler the creator;post malone;21 savage;future;lil wayne;nas;2pac;the notorious b i g;snoop dogg;dr dre;50 cent;logic;macklemore;macklemore ryan lewis;childish gambino;a ap rocky;mac miller;juice wrld;lil uzi vert;cardi b;nicki minaj;megan thee stallion;run the jewels;joyner lucas;token;tech n9ne;lil nas x;ice cube;wu tang clan;outkast;kid cudi;chance the rapper;big sean;pusha t;denzel curry;jid;j i d;polo g;roddy ricch;dababy;doja cat;lizzo;mgk;machine gun kelly;ar ab;mero;kc rebell;summer cem;olexesh;xatar;seeed;sugar mmfk;bass sultan hengzt;sentino;rooz;prezident;swiss;dardan;gringo;miksu macloud;hayiti`,
  pop: `taylor swift;ed sheeran;ariana grande;dua lipa;the weeknd;billie eilish;harry styles;justin bieber;adele;lady gaga;rihanna;beyonce;katy perry;bruno mars;coldplay;imagine dragons;maroon 5;onerepublic;shawn mendes;selena gomez;miley cyrus;olivia rodrigo;sia;lewis capaldi;sam smith;calum scott;mark forster;sarah connor;helene fischer;andreas bourani;silbermond;tokio hotel;wincent weiss;lena;namika;lea;revolverheld;johannes oerding;max giesinger;alvaro soler;glasperlenspiel;culcha candela;nena;rosenstolz;michael jackson;madonna;britney spears;ke ha;pink;p nk;shakira;jennifer lopez;justin timberlake;charlie puth;camila cabello;meghan trainor;zara larsson;ava max;tate mcrae;sabrina carpenter;lizzo;the chainsmokers;abba;george michael;elton john;whitney houston;celine dion;mariah carey;backstreet boys;nsync;one direction;westlife;take that;robbie williams;kelly clarkson;demi lovato;jonas brothers;5 seconds of summer;twenty one pilots;lorde;halsey;ellie goulding;jason derulo;enrique iglesias;luis fonsi;bad bunny;maluma;j balvin;daddy yankee;rosalia;stromae;christina stuermer;die prinzen;pur;howard carpendale;roland kaiser;andrea berg;michael wendler;mickie krause;ballermann hits;ikke huftgold;schlager;vanessa mai;beatrice egli;kerstin ott;jan delay;mia;juli;sportfreunde stiller;die toten hosen;laith al deen;ich und ich;xavier naidoo;sasha;thomas d;mary roos;lou bega;modern talking;scooter`,
  rock: `linkin park;metallica;rammstein;ac dc;queen;nirvana;foo fighters;green day;red hot chili peppers;guns n roses;led zeppelin;pink floyd;the beatles;the rolling stones;system of a down;slipknot;bring me the horizon;sum 41;blink 182;die arzte;die toten hosen;bohse onkelz;broilers;beatsteaks;kraftklub;farin urlaub;muse;billy talent;rise against;papa roach;disturbed;avenged sevenfold;iron maiden;black sabbath;ghost;sabaton;powerwolf;amon amarth;korn;limp bizkit;rage against the machine;my chemical romance;fall out boy;panic at the disco;skillet;hollywood undead;three days grace;breaking benjamin;pennywise;nofx;the offspring;social distortion;dropkick murphys;sex pistols;the clash;ramones;ensiferum;in extremo;subway to sally;saltatio mortis;eisbrecher;oomph;nightwish;within temptation;epica;lacuna coil;evanescence;motorhead;judas priest;slayer;megadeth;pantera;lamb of god;trivium;architects;parkway drive;fit for a king;spiritbox;sleep token;deftones;tool;a perfect circle;alice in chains;soundgarden;pearl jam;stone temple pilots;the doors;jimi hendrix;deep purple;scorpions;kiss;aerosmith;bon jovi;def leppard;van halen;ozzy osbourne;the who;thin lizzy;creedence clearwater revival;lynyrd skynyrd;the black keys;royal blood;greta van fleet;wolfmother;the white stripes;queens of the stone age;mastodon;gojira;heaven shall burn;callejon;hatebreed;emil bulls;donots;itchy;turbostaat;feine sahne fischfilet;frei wild;onkelz;toxpack;sondaschule;ska p;the hives;the cult;bad religion;rancid;anti flag;good charlotte;simple plan;yellowcard;taking back sunday;all time low;neck deep;state champs;pierce the veil;sleeping with sirens;asking alexandria;motionless in white;falling in reverse;bullet for my valentine;trivium;volbeat;five finger death punch;shinedown;godsmack;seether;nickelback;creed;staind;hoobastank`,
  indie: `mumford sons;the lumineers;bon iver;fleet foxes;of monsters and men;tom odell;hozier;passenger;ben howard;milky chance;cat stevens;bob dylan;johnny cash;simon garfunkel;leonard cohen;radiohead;arctic monkeys;the strokes;tame impala;mac demarco;vampire weekend;lana del rey;phoebe bridgers;noah kahan;novo amor;dermot kennedy;declan mckenna;annenmaykantereit;bosse;tocotronic;element of crime;wir sind helden;von wegen lisbeth;faber;giant rooks;isolation berlin;felix kummer;the national;the xx;alt j;foster the people;mgmt;two door cinema club;the kooks;bastille;george ezra;jamie t;james bay;josh groban;john mayer;jack johnson;damien rice;iron wine;sufjan stevens;the head and the heart;jose gonzalez;nick drake;elliott smith;the cure;the smiths;joy division;depeche mode;the killers;kings of leon;the fray;snow patrol;keane;travis;oasis;blur;the verve;suede;pulp;placebo;editors;interpol;bloc party;franz ferdinand;the libertines;the vaccines;catfish and the bottlemen;wolf alice;the 1975;glass animals;rex orange county;clairo;beabadoobee;girl in red;mitski;boygenius;big thief;the war on drugs;wilco;neutral milk hotel;death cab for cutie;modest mouse;the shins;belle and sebastian;sigur ros;birdy;ed sheeran x;lauv;gregory alan isakov;the paper kites;lord huron;oh wonder;kodaline;the script;a great big world;max herre;philipp poisel;gisbert zu knyphausen;judith holofernes;lilly among clouds;luna;zartmann;pavel;die orsons;dota;kettcar;madsen;thees uhlmann;tomte;sven regener;bernd begemann;ok kid;mia;nils frahm;olafur arnalds;ludovico einaudi;max richter;yiruma;hans zimmer`,
  electronic: `avicii;calvin harris;david guetta;martin garrix;kygo;alan walker;marshmello;zedd;daft punk;deadmau5;skrillex;swedish house mafia;tiesto;armin van buuren;robin schulz;felix jaehn;parov stelar;paul kalkbrenner;boris brejcha;fred again;fisher;peggy gou;odesza;flume;disclosure;the chemical brothers;the prodigy;modeselektor;apparat;bonobo;lost frequencies;alle farben;dimitri vegas like mike;afrojack;hardwell;steve aoki;diplo;major lazer;jauz;illenium;seven lions;porter robinson;madeon;gesaffelstein;kavinsky;justice;moderat;kollektiv turmstrasse;purple disco machine;meduza;cassius;bob sinclar;lilly palmer;charlotte de witte;amelie lens;adam beyer;nina kraviz;carl cox;solomun;tale of us;argy;anyma;dixon;monolink;kraftwerk;jean michel jarre;vangelis;moby;fatboy slim;basement jaxx;groove armada;faithless;underworld;orbital;aphex twin;boards of canada;burial;four tet;jon hopkins;caribou;hot chip;lcd soundsystem;crystal castles;chvrches;purity ring;grimes;kaytranada;rufus du sol;lane 8;ben bohmer;yotto;dj snake;tchami;mura masa;sophie;charli xcx;a g cook;rl grime;basshunter;vengaboys;snap;haddaway;culture beat;cascada;sash;dj bobo;dj otzi;mr president;blümchen;blumchen;alphaville;hurts;dua lipa x`,
  hoerspiel: `die drei;die drei kids;tkkg;benjamin blumchen;bibi blocksberg;bibi tina;was ist was;pumuckl;die kanguru chroniken;marc uwe kling;funf freunde;hui buh;conni;peppa wutz;pettersson und findus;rolf zuckowski;sesamstrasse;die maus;der kleine rabe socke;lars der eisbar;heidi;pippi langstrumpf;harry potter;rufus beck;gruselkabinett;sherlock holmes;john sinclair;geisterjager;ohrenbar;checker tobi;wissen macht ah;die schlumpfe;die olchis;der rauber hotzenplotz;michel aus lonneberga;die pfefferkorner;lauras stern;das sams;die kleine hexe;der kleine drache kokosnuss;bobo siebenschlafer;paw patrol;feuerwehrmann sam;bob der baumeister;thomas die lokomotive;fuchs und elster;die biene maja;wickie;nils holgersson;ritter rost;timm thaler;die wilden hühner;die wilden huhner;fünf freunde;drei fragezeichen;europa;maxim gorki;sprecher;horspiel;hörspiel;kinderlieder;kindermusik;simone sommerland;volker rosin;karsten glück;4 3 2 1;deine freunde;the kiboomers;kikaninchen;sandmannchen;ein fall fur tkkg;lotta;minecraft;pixi;lesestart`,
};

export function normalize(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ß/g, "ss")
    .replace(/\$/g, "s")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const INDEX = new Map<string, Genre>();
for (const [genre, list] of Object.entries(LISTS) as [Genre, string][]) {
  for (const raw of list.split(";")) {
    const key = normalize(raw);
    // First list wins when a name appears twice, so genre order above matters little.
    if (key && !INDEX.has(key)) INDEX.set(key, genre);
  }
}

const KEYWORDS: [RegExp, Genre][] = [
  [/\b(horspiel|folge|kids|kinder)\b/, "hoerspiel"],
  [/\b(dj|remix|beats)\b/, "electronic"],
  [/\b(mc|gang|crew)\b/, "rap"],
  [/\b(band|metal|punk)\b/, "rock"],
];

export function genreOf(artist: string): Genre | null {
  const key = normalize(artist);
  if (!key) return null;
  const hit = INDEX.get(key);
  if (hit) return hit;
  for (const [re, g] of KEYWORDS) if (re.test(key)) return g;
  return null;
}

export interface GenreMix {
  byGenre: Partial<Record<Genre, number>>;
  matchedMs: number;
  totalMs: number;
}

const MIN_COVERAGE = 0.12;

export function dominantGenre(mix: GenreMix): Genre | null {
  if (!mix.totalMs || mix.matchedMs / mix.totalMs < MIN_COVERAGE) return null;
  let best: Genre | null = null;
  let max = 0;
  for (const [g, ms] of Object.entries(mix.byGenre) as [Genre, number][]) {
    if (ms > max) {
      max = ms;
      best = g;
    }
  }
  return best;
}
