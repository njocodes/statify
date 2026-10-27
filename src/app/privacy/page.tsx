"use client";
import { Ext, GH_ISSUES, LegalPage, type LegalText } from "@/components/LegalPage";

const en: LegalText = {
  title: "Privacy",
  blocks: [
    { h: "Short version", p: <p>Statify has no server, no accounts, no cookies and no analytics. The files you load are read in your browser and stay on your device.</p> },
    {
      h: "What stays on your device",
      p: <p>Your streaming history, your settings and cached covers and genres are stored in your browser (IndexedDB and local storage). Nothing of this is sent to me. You can delete it any time in Settings or on the start page.</p>,
    },
    {
      h: "Hosting",
      p: (
        <p>
          The site is delivered by Vercel Inc. (USA). Like every web host, Vercel processes technical connection data such as your IP address, the requested page and the time in server logs. Statify itself does not see or evaluate this data.
        </p>
      ),
    },
    {
      h: "Requests to third parties",
      p: (
        <>
          <p>When album covers are shown, your browser loads them from Spotify (oEmbed endpoint and image servers). Spotify then receives your IP address and the Spotify ID of the item. Without covers nothing is requested.</p>
          <p>Only if you press the button in Settings, artist names (no other data) are sent to MusicBrainz to look up genres.</p>
        </>
      ),
    },
    { h: "Your rights", p: <p>As far as personal data is processed by the hosting provider you can ask for access, correction and deletion and may complain to a data protection authority. For anything about this project contact me through <Ext href={GH_ISSUES}>GitHub Issues</Ext>.</p> },
  ],
};

const de: LegalText = {
  title: "Datenschutz",
  blocks: [
    { h: "Kurzfassung", p: <p>Statify hat keinen Server, keine Konten, keine Cookies und keine Analyse. Die geladenen Dateien werden in deinem Browser gelesen und bleiben auf deinem Gerät.</p> },
    {
      h: "Was auf deinem Gerät bleibt",
      p: <p>Dein Streaming-Verlauf, deine Einstellungen sowie zwischengespeicherte Cover und Genres liegen in deinem Browser (IndexedDB und Local Storage). Nichts davon wird an mich gesendet. Du kannst es jederzeit in den Einstellungen oder auf der Startseite löschen.</p>,
    },
    {
      h: "Hosting",
      p: <p>Die Seite wird von Vercel Inc. (USA) ausgeliefert. Wie bei jedem Webhoster verarbeitet Vercel technische Verbindungsdaten wie IP-Adresse, aufgerufene Seite und Uhrzeit in Server-Logs. Statify selbst sieht und wertet diese Daten nicht aus.</p>,
    },
    {
      h: "Anfragen an Dritte",
      p: (
        <>
          <p>Wenn Album-Cover angezeigt werden, lädt dein Browser sie von Spotify (oEmbed-Schnittstelle und Bildserver). Spotify erhält dabei deine IP-Adresse und die Spotify-ID des Eintrags. Ohne Cover wird nichts angefragt.</p>
          <p>Nur wenn du in den Einstellungen den Button drückst, werden Künstlernamen (keine anderen Daten) an MusicBrainz gesendet, um Genres nachzuschlagen.</p>
        </>
      ),
    },
    { h: "Deine Rechte", p: <p>Soweit der Hosting-Anbieter personenbezogene Daten verarbeitet, kannst du Auskunft, Berichtigung und Löschung verlangen und dich bei einer Datenschutzaufsicht beschweren. Für alles zu diesem Projekt erreichst du mich über <Ext href={GH_ISSUES}>GitHub Issues</Ext>.</p> },
  ],
};

export default function Privacy() {
  return <LegalPage texts={{ en, de }} />;
}
