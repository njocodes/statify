import type { Genre } from "./themes";

// The Spotify export has no genre field, so a hand-curated artist list is the genre source.
// Names are matched after normalize() (lowercase, no diacritics/punctuation).
const LISTS: Record<Genre, string> = {
  // reggae and latin come first so their specialists are not taken by the broader pop list
  reggae: `bob marley;peter tosh;burning spear;damian marley;chronixx;protoje;sean paul;shaggy;shabba ranks;buju banton;beenie man;vybz kartel;popcaan;koffee;sizzla;capleton;seeed;gentleman;culcha candela;patrice;jah cure;alborosie;lee scratch perry;toots the maytals;ub40;steel pulse;dub inc;soldiers of jah army;stick figure;rebelution;groundation;collie buddz;barrington levy;dennis brown;gregory isaacs;jimmy cliff;eddy grant;inner circle;morgan heritage;stephen marley;ziggy marley;skip marley;kabaka pyramid;lila ike;spice;mavado;busy signal;demarco;tarrus riley;romain virgo;freddie mcgregor`,
  latin: `bad bunny;j balvin;daddy yankee;ozuna;karol g;anuel aa;maluma;rauw alejandro;shakira;enrique iglesias;ricky martin;luis fonsi;nicky jam;myke towers;feid;sech;becky g;rosalia;jhay cortez;farruko;wisin yandel;wisin;yandel;don omar;tego calderon;marc anthony;romeo santos;aventura;prince royce;carlos vives;juanes;manu chao;gipsy kings;buena vista social club;celia cruz;willie colon;ruben blades;camilo;tini;c tangana;quevedo;bizarrap;peso pluma;natanael cano;junior h;grupo frontera;fuerza regida;eslabon armado;gloria estefan;mon laferte;morat;sebastian yatra;chino nacho;mora;eladio carrion;lunay;zion lennox;arcangel;de la ghetto;jowell randy;nio garcia;casper magico;darell;kevin roldan;blessd;ryan castro;young miko;ivy queen;pitbull;yandel;fonseca;paulina rubio;thalia;la oreja de van gogh;mana;cafe tacvba;los fabulosos cadillacs;soda stereo;enanitos verdes;gente de zona;el alfa;tokischa;rochy rd`,
  metal: `metallica;rammstein;system of a down;slipknot;iron maiden;black sabbath;ghost;sabaton;powerwolf;amon amarth;korn;ensiferum;in extremo;subway to sally;saltatio mortis;eisbrecher;oomph;nightwish;within temptation;epica;lacuna coil;motorhead;judas priest;slayer;megadeth;pantera;lamb of god;trivium;architects;parkway drive;fit for a king;spiritbox;sleep token;deftones;gojira;mastodon;heaven shall burn;avenged sevenfold;bullet for my valentine;volbeat;five finger death punch;disturbed;bring me the horizon;motionless in white;falling in reverse;asking alexandria;callejon;hatebreed;kreator;sodom;tankard;accept;helloween;blind guardian;gamma ray;dream theater;opeth;meshuggah;behemoth;dimmu borgir;cradle of filth;children of bodom;in flames;dark tranquillity;at the gates;arch enemy;lordi;alestorm;eluveitie;feuerschwanz;schandmaul;letzte instanz;rob zombie;marilyn manson;motley crue`,
  techno: `paul kalkbrenner;boris brejcha;charlotte de witte;amelie lens;adam beyer;nina kraviz;carl cox;solomun;tale of us;argy;anyma;dixon;monolink;kollektiv turmstrasse;lilly palmer;the prodigy;fisher;peggy gou;ben bohmer;yotto;lane 8;dj koze;maceo plex;richie hawtin;sven vath;robert hood;jeff mills;oliver koletzki;worakls;reinier zonneveld;fritz kalkbrenner;dubfire;adriatique;boys noize;ellen allien;apparat;modeselektor;moderat;scooter;kobosil;i hate models;enrico sangiuliano;indira paganotto;hot since 82;dj tennis`,
  folk: `bob dylan;simon garfunkel;leonard cohen;cat stevens;passenger;bon iver;fleet foxes;the lumineers;mumford sons;of monsters and men;hozier;ben howard;jose gonzalez;nick drake;iron wine;damien rice;the paper kites;lord huron;gregory alan isakov;the head and the heart;noah kahan;novo amor;dermot kennedy;ben harper;jack johnson;milky chance;philipp poisel;sufjan stevens;the tallest man on earth;kings of convenience;angus julia stone;john denver;woody guthrie;joan baez;joni mitchell;neil young;fleetwood mac;the civil wars;the avett brothers;first aid kit;daughter;birdy;seeed x`,
  ambient: `nils frahm;olafur arnalds;ludovico einaudi;max richter;yiruma;hans zimmer;brian eno;tycho;jon hopkins;boards of canada;aphex twin;kiasmos;agnes obel;sigur ros;explosions in the sky;mogwai;god is an astronaut;hammock;stars of the lid;hania rani;joep beving;dustin o halloran;johann johannsson;ryuichi sakamoto;jean michel jarre;vangelis;kraftwerk;john williams;ennio morricone;howard shore;ramin djawadi;michael giacchino;alan silvestri;lorne balfe;two steps from hell;audiomachine;thomas bergersen;klaus badelt;harry gregson williams;james horner;danny elfman;hildur gudnadottir;ludwig goransson;trent reznor atticus ross`,
  jazz: `miles davis;john coltrane;thelonious monk;duke ellington;louis armstrong;ella fitzgerald;billie holiday;nina simone;dave brubeck;bill evans;herbie hancock;chet baker;charlie parker;art blakey;sonny rollins;cannonball adderley;stan getz;oscar peterson;diana krall;norah jones;michael buble;jamie cullum;gregory porter;kamasi washington;snarky puppy;robert glasper;esperanza spalding;melody gardot;madeleine peyroux;ray charles;frank sinatra;dean martin;tony bennett;nat king cole;caro emerald;kyle eastwood;jacob collier;laufey;cory henry;thundercat;avishai cohen;gogo penguin;e s t;youn sun nah;till bronner;lars danielsson;roy hargrove`,
  klassik: `ludwig van beethoven;beethoven;wolfgang amadeus mozart;mozart;johann sebastian bach;bach;frederic chopin;chopin;claude debussy;franz schubert;antonio vivaldi;vivaldi;pyotr ilyich tchaikovsky;johannes brahms;richard wagner;giuseppe verdi;erik satie;maurice ravel;franz liszt;joseph haydn;georg friedrich handel;edvard grieg;antonin dvorak;berliner philharmoniker;wiener philharmoniker;london symphony orchestra;lang lang;daniel barenboim;yo yo ma;hilary hahn;anne sophie mutter;vikingur olafsson;igor levit;khatia buniatishvili;lindsey stirling;david garrett;andre rieu;the piano guys;2cellos`,
  country: `johnny cash;dolly parton;willie nelson;luke combs;morgan wallen;chris stapleton;zach bryan;kane brown;luke bryan;blake shelton;carrie underwood;tim mcgraw;garth brooks;kenny rogers;shania twain;kacey musgraves;tyler childers;sturgill simpson;jason aldean;florida georgia line;dierks bentley;eric church;keith urban;brad paisley;lainey wilson;jelly roll;hank williams;merle haggard;george strait;alan jackson;gunter gabriel;truck stop;texas lightning;the highwaymen;old crow medicine show;john prine;steve earle;townes van zandt;orville peck;shaboozey`,
  rnb: `usher;alicia keys;destinys child;aaliyah;ne yo;chris brown;sza;frank ocean;miguel;brandy;monica;toni braxton;jodeci;boyz ii men;jacquees;summer walker;daniel caesar;h e r;giveon;khalid;bryson tiller;jhene aiko;kehlani;ella mai;jorja smith;lucky daye;anderson paak;ciara;lauryn hill;the fugees;erykah badu;d angelo;mary j blige;112;blackstreet;tlc;en vogue;sade;janet jackson;prince;stevie wonder;marvin gaye;al green;otis redding;aretha franklin;james brown;earth wind fire;kool the gang;chic;donna summer;bee gees`,
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

// Genres found by the optional MusicBrainz lookup; they fill gaps but never override the curated lists.
const EXTRA = new Map<string, Genre>();
export function setExtraGenre(key: string, genre: Genre) {
  EXTRA.set(key, genre);
}

// MusicBrainz tag -> genre; the first matching rule per tag counts, specific rules come first.
const TAG_RULES: [RegExp, Genre][] = [
  [/metal/, "metal"],
  [/techno|minimal|tech house/, "techno"],
  [/hip.?hop|\brap\b|trap|drill/, "rap"],
  [/r&b|rnb|rhythm and blues|\bsoul\b/, "rnb"],
  [/ambient|new age|neoclassical|drone/, "ambient"],
  [/electro|house|edm|trance|dubstep|drum and bass|dance|synthwave|downtempo/, "electronic"],
  [/jazz|swing|bebop/, "jazz"],
  [/classical|orchestra|opera|baroque|symphon|soundtrack|score/, "klassik"],
  [/country|bluegrass|americana/, "country"],
  [/folk|singer.?songwriter/, "folk"],
  [/indie|shoegaze|dream pop|lo-?fi/, "indie"],
  [/rock|punk|grunge|hardcore|emo/, "rock"],
  [/audiobook|spoken|h[oö]rspiel|children/, "hoerspiel"],
  [/\bpop\b|k-pop|synth-?pop/, "pop"],
];

/** Picks the genre with the most tag votes. */
export function genreFromTags(tags: { name: string; count: number }[]): Genre | null {
  const votes = new Map<Genre, number>();
  for (const t of tags) {
    const rule = TAG_RULES.find(([re]) => re.test(t.name.toLowerCase()));
    if (rule) votes.set(rule[1], (votes.get(rule[1]) ?? 0) + Math.max(1, t.count));
  }
  return [...votes].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
}

export function genreOf(artist: string): Genre | null {
  const key = normalize(artist);
  if (!key) return null;
  const hit = INDEX.get(key) ?? EXTRA.get(key);
  if (hit) return hit;
  for (const [re, g] of KEYWORDS) if (re.test(key)) return g;
  return null;
}


// ---- sub-genres: a finer split inside the main genres (themes still follow the main genre) ----
// Artists of a main genre that are in none of these lists land in "<genre>" itself (labelled "other" in the UI).
export const SUBGENRES: Record<string, { parent: Genre; artists: string }> = {
  // first match wins, so these come before the broader pop/rap lists that share some names
  reggae_roots: { parent: "reggae", artists: "bob marley;peter tosh;burning spear;jimmy cliff;toots the maytals;ub40;steel pulse;dennis brown;gregory isaacs;barrington levy;lee scratch perry;damian marley;stephen marley;ziggy marley;skip marley;chronixx;protoje;kabaka pyramid;jah cure;morgan heritage;groundation;rebelution;stick figure;soldiers of jah army;alborosie;tarrus riley;romain virgo;freddie mcgregor;inner circle;eddy grant;lila ike" },
  reggae_dancehall: { parent: "reggae", artists: "sean paul;shaggy;shabba ranks;buju banton;beenie man;vybz kartel;popcaan;koffee;sizzla;capleton;spice;mavado;busy signal;demarco;collie buddz" },
  reggae_de: { parent: "reggae", artists: "seeed;gentleman;culcha candela;patrice;dub inc" },
  latin_reggaeton: { parent: "latin", artists: "bad bunny;j balvin;daddy yankee;ozuna;karol g;anuel aa;maluma;rauw alejandro;nicky jam;myke towers;feid;sech;becky g;jhay cortez;farruko;wisin yandel;wisin;yandel;don omar;tego calderon;chino nacho;mora;eladio carrion;lunay;zion lennox;arcangel;de la ghetto;jowell randy;nio garcia;casper magico;darell;kevin roldan;blessd;ryan castro;young miko;ivy queen;tokischa;el alfa;rochy rd;quevedo;bizarrap" },
  latin_pop: { parent: "latin", artists: "shakira;enrique iglesias;ricky martin;luis fonsi;camilo;tini;sebastian yatra;morat;carlos vives;juanes;gloria estefan;paulina rubio;thalia;pitbull;fonseca;mon laferte;rosalia;c tangana" },
  latin_tropical: { parent: "latin", artists: "marc anthony;romeo santos;aventura;prince royce;celia cruz;willie colon;ruben blades;gipsy kings;buena vista social club;manu chao;gente de zona" },
  latin_regional: { parent: "latin", artists: "peso pluma;natanael cano;junior h;fuerza regida;eslabon armado;grupo frontera" },
  latin_rock: { parent: "latin", artists: "mana;cafe tacvba;los fabulosos cadillacs;soda stereo;enanitos verdes;la oreja de van gogh" },
  rap_boombap: { parent: "rap", artists: "beginner;absolute beginner;samy deluxe;dendemann;freundeskreis;die fantastischen vier;fettes brot;blumentopf;torch;afrob;curse;jan delay;peter fox;seeed;marteria;casper;kaptn peng;prinz pi;fatoni;edgar wasser;retrogott;hulk hodn;morlockk dilemma;kitschkrieg;raportagen;moop mama;antilopen gang;nas;wu tang clan;outkast;a tribe called quest;j cole;kendrick lamar;run the jewels;chance the rapper;logic;joyner lucas;ice cube;2pac;the notorious b i g;dr dre;snoop dogg" },
  rap_street: { parent: "rap", artists: "bushido;sido;kollegah;farid bang;haftbefehl;kool savas;eko fresh;fler;shindy;kc rebell;summer cem;olexesh;xatar;azet;zuna;celo abdi;bass sultan hengzt;mero;gzuz;187 strassenbande;bonez mc;ssio;samra;ak ausserkontrolle;capital bra;50 cent;ice cube" },
  rap_trap: { parent: "rap", artists: "rin;ufo361;apache 207;ski aggu;luciano;lune;badmomzjay;ennio;nimo;trettmann;haiyti;yung hurn;bausa;miksu macloud;dardan;gringo;disarstar;travis scott;future;21 savage;lil uzi vert;juice wrld;polo g;roddy ricch;dababy;post malone;lil wayne;lil nas x;cardi b;nicki minaj;megan thee stallion;drake;kanye west;ye;tyler the creator;a ap rocky;mac miller;kid cudi;doja cat;lizzo;lil dicky;nf;eminem;denzel curry;jid;j i d;pusha t;big sean" },
  rock_punk: { parent: "rock", artists: "green day;blink 182;sum 41;the offspring;rancid;nofx;pennywise;bad religion;ramones;sex pistols;the clash;die toten hosen;broilers;beatsteaks;donots;itchy;turbostaat;feine sahne fischfilet;frei wild;toxpack;sondaschule;dropkick murphys;social distortion;rise against;anti flag;good charlotte;simple plan;yellowcard;taking back sunday;all time low;neck deep;state champs;pierce the veil;sleeping with sirens;fall out boy;panic at the disco;my chemical romance;the hives;die arzte;farin urlaub;kraftklub;wir sind helden" },
  rock_classic: { parent: "rock", artists: "queen;ac dc;led zeppelin;pink floyd;the beatles;the rolling stones;guns n roses;the doors;jimi hendrix;deep purple;scorpions;kiss;aerosmith;bon jovi;def leppard;van halen;ozzy osbourne;the who;thin lizzy;creedence clearwater revival;lynyrd skynyrd;fleetwood mac;bohse onkelz;onkelz;queens of the stone age;the black keys;royal blood;greta van fleet;wolfmother;the white stripes;red hot chili peppers" },
  rock_alt: { parent: "rock", artists: "linkin park;nirvana;foo fighters;muse;billy talent;papa roach;limp bizkit;rage against the machine;korn;system of a down;deftones;tool;a perfect circle;alice in chains;soundgarden;pearl jam;stone temple pilots;evanescence;skillet;hollywood undead;three days grace;breaking benjamin;disturbed;shinedown;godsmack;seether;nickelback;creed;staind;hoobastank;twenty one pilots;bring me the horizon;bullet for my valentine;five finger death punch;volbeat;mgk;machine gun kelly;falling in reverse;motionless in white;asking alexandria;emil bulls;callejon" },
  metal_heavy: { parent: "metal", artists: "metallica;iron maiden;black sabbath;judas priest;slayer;megadeth;pantera;motorhead;accept;helloween;blind guardian;gamma ray;dream theater;sabaton;powerwolf;amon amarth;ghost;kreator;sodom;tankard;avenged sevenfold;opeth;volbeat;lordi;alestorm;nightwish;within temptation;epica;lacuna coil;children of bodom;in flames;dark tranquillity;at the gates;arch enemy;dimmu borgir;cradle of filth;behemoth;meshuggah;mastodon;gojira" },
  metal_core: { parent: "metal", artists: "architects;parkway drive;fit for a king;spiritbox;sleep token;lamb of god;trivium;heaven shall burn;hatebreed;bring me the horizon;bullet for my valentine;motionless in white;falling in reverse;asking alexandria;callejon;slipknot;korn;deftones;system of a down" },
  metal_ndh: { parent: "metal", artists: "rammstein;eisbrecher;oomph;rob zombie;marilyn manson;motley crue;ensiferum;in extremo;subway to sally;saltatio mortis;schandmaul;feuerschwanz;letzte instanz;eluveitie" },
  pop_de: { parent: "pop", artists: "mark forster;sarah connor;andreas bourani;silbermond;tokio hotel;wincent weiss;lena;namika;lea;revolverheld;johannes oerding;max giesinger;alvaro soler;glasperlenspiel;culcha candela;nena;rosenstolz;christina stuermer;die prinzen;pur;mia;juli;sportfreunde stiller;laith al deen;ich und ich;xavier naidoo;sasha;thomas d;mary roos;lou bega;modern talking;blumchen;cro;casper;peter fox;clueso;max herre" },
  pop_schlager: { parent: "pop", artists: "helene fischer;howard carpendale;roland kaiser;andrea berg;michael wendler;mickie krause;ballermann hits;ikke huftgold;schlager;vanessa mai;beatrice egli;kerstin ott;dj otzi;mr president" },
  pop_int: { parent: "pop", artists: "taylor swift;ed sheeran;ariana grande;dua lipa;the weeknd;billie eilish;harry styles;justin bieber;adele;lady gaga;rihanna;beyonce;katy perry;bruno mars;coldplay;imagine dragons;maroon 5;onerepublic;shawn mendes;selena gomez;miley cyrus;olivia rodrigo;sia;lewis capaldi;sam smith;calum scott;michael jackson;madonna;britney spears;pink;shakira;jennifer lopez;justin timberlake;charlie puth;camila cabello;meghan trainor;zara larsson;ava max;tate mcrae;sabrina carpenter;abba;george michael;elton john;whitney houston;celine dion;mariah carey;backstreet boys;one direction;robbie williams;kelly clarkson;demi lovato;lorde;halsey;ellie goulding;jason derulo;enrique iglesias;bad bunny;rosalia;stromae" },
  electronic_edm: { parent: "electronic", artists: "avicii;calvin harris;david guetta;martin garrix;kygo;alan walker;marshmello;zedd;tiesto;armin van buuren;robin schulz;felix jaehn;alle farben;lost frequencies;dimitri vegas like mike;afrojack;hardwell;steve aoki;diplo;major lazer;jauz;illenium;seven lions;swedish house mafia;the chainsmokers;basshunter;vengaboys;snap;haddaway;culture beat;cascada;sash;dj bobo;scooter" },
  electronic_chill: { parent: "electronic", artists: "bonobo;moderat;apparat;modeselektor;four tet;jon hopkins;caribou;burial;boards of canada;aphex twin;odesza;flume;disclosure;kaytranada;rufus du sol;lane 8;ben bohmer;yotto;parov stelar;cassius;purple disco machine;meduza;bob sinclar;daft punk;justice;kavinsky;gesaffelstein;deadmau5;skrillex;madeon;porter robinson;crystal castles;chvrches;purity ring;grimes;mura masa;fred again;the chemical brothers;the prodigy;fisher;peggy gou;kollektiv turmstrasse" },
  rnb_soul: { parent: "rnb", artists: "marvin gaye;stevie wonder;al green;otis redding;aretha franklin;james brown;earth wind fire;kool the gang;chic;donna summer;bee gees;prince;sade;erykah badu;d angelo;lauryn hill;the fugees;mary j blige;tlc;en vogue;janet jackson;boyz ii men;jodeci;blackstreet;112;brandy;monica;toni braxton;aaliyah;destinys child" },
};

const SUB_INDEX = new Map<string, string>();
for (const [id, { artists }] of Object.entries(SUBGENRES)) {
  for (const raw of artists.split(";")) {
    const key = normalize(raw);
    if (key && !SUB_INDEX.has(key)) SUB_INDEX.set(key, id);
  }
}

/** sub-genre id of an artist ("rap_trap", …), the plain genre id when no finer list knows it, or null */
export function subGenreOf(artist: string): { genre: Genre; sub: string } | null {
  const genre = genreOf(artist);
  if (!genre) return null;
  const sub = SUB_INDEX.get(normalize(artist));
  // a sub-genre only counts when it belongs to the artist's main genre
  return { genre, sub: sub && SUBGENRES[sub].parent === genre ? sub : genre };
}

export interface GenreMix {
  byGenre: Partial<Record<Genre, number>>;
  matchedMs: number;
  totalMs: number;
  /** share of track plays that were skipped */
  skipRate: number;
  /** share of listening time between 00:00 and 05:00 local time */
  nightShare: number;
  /** the same numbers per calendar year, so every Wrapped year can get its own style */
  yearly?: Record<string, GenreMix>;
}

const MIN_COVERAGE = 0.12;

/** genres ranked by listening time, or [] when too little of the history could be matched */
export function rankedGenres(mix: GenreMix): Genre[] {
  if (!mix.totalMs || mix.matchedMs / mix.totalMs < MIN_COVERAGE) return [];
  return (Object.entries(mix.byGenre) as [Genre, number][]).sort((a, b) => b[1] - a[1]).map(([g]) => g);
}

export function dominantGenre(mix: GenreMix): Genre | null {
  return rankedGenres(mix)[0] ?? null;
}

/** a second genre only counts as an accent when it is a real part of the history */
export function secondaryGenre(mix: GenreMix): Genre | null {
  const [, second] = rankedGenres(mix);
  return second && (mix.byGenre[second] ?? 0) / mix.matchedMs >= 0.05 ? second : null;
}

export type Mood = "happy" | "grumpy" | "sleepy";
export type Hat = "none" | "cap" | "cowboy" | "beret" | "spikes" | "shades" | "crown" | "flower" | "beanie";

export function moodOf(mix: GenreMix): Mood {
  if (mix.nightShare > 0.15) return "sleepy";
  if (mix.skipRate > 0.45) return "grumpy";
  return "happy";
}

const HAT: Partial<Record<Genre, Hat>> = { rap: "cap", country: "cowboy", jazz: "beret", klassik: "beret", rock: "spikes", metal: "spikes", pop: "crown", electronic: "shades", techno: "shades", indie: "flower", folk: "flower", reggae: "beanie", latin: "crown" };
export const hatOf = (g: Genre | null): Hat => (g && HAT[g]) || "none";
