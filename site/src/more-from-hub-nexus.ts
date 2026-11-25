/** The other Hub Nexus apps, for the home page and the About page: only apps that are live and public, from the one
 * list (../../../docs/brand.md › More from Hub Nexus: the list), each by its hubnx name. */
interface OtherApp {
  name: string;
  url: string;
  blurb: string; // after the name, with its own punctuation
  onHome: boolean; // the home page shows the apps for the same people; About shows every live one
}

const OTHER_APPS: OtherApp[] = [
  { name: "hubnx Music", url: "https://music.hubnx.com", onHome: true,
    blurb: ": make full songs with vocals on your own computer, free, for Mac, Windows and Linux." },
  { name: "hubnx Write", url: "https://www.hubnx.com/apps/write", onHome: true,
    blurb: ": a free writing app for your computer, for Mac and Linux; Windows soon." },
  { name: "hubnx Typing", url: "https://typing.hubnx.com", onHome: false,
    blurb: ": free touch-typing practice that names the finger for every key." },
  { name: "hubnx Globe", url: "https://globe.hubnx.com", onHome: false,
    blurb: ": a free 3D world map with MGRS and UTM grids, from space to any street." },
  { name: "hubnx Desk", url: "https://desk.hubnx.com", onHome: false,
    blurb: ", for agencies: an AI front desk that agencies set up for the local businesses they serve." },
];

const link = (app: OtherApp) => `<a href="${app.url}"><strong>${app.name}</strong></a>`;

export function renderMoreOnHome(): string {
  return OTHER_APPS.filter((app) => app.onHome).map((app) => `<p>${link(app)}${app.blurb}</p>`).join("\n        ");
}

export function renderMoreOnAbout(): string {
  return OTHER_APPS.map((app) => `<li>${link(app)}${app.blurb}</li>`).join("\n          ");
}
