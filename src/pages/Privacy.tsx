import { LegalPage } from "@/components/LegalPage";

const Privacy = () => (
  <LegalPage
    title="Privacy Policy"
    summary="This policy explains what information Expressly handles, why it is needed, and the choices available to parents and caregivers."
    sections={[
      {
        title: "Who manages the account",
        content: <p>Expressly accounts are intended to be created and managed by a parent, legal guardian, caregiver, or authorized professional. A learner does not need an email address to use the communication board.</p>,
      },
      {
        title: "Information Expressly handles",
        content: (
          <ul className="list-disc space-y-2 pl-5">
            <li>Parent or caregiver email and authentication records used to secure the account.</li>
            <li>Learner name, profile image, language, vocabulary level, character preference, and display settings.</li>
            <li>Custom cards, card images, selected words, completed sentences, and card-use history.</li>
            <li>Feature-use counts and subscription access used to enforce account limits.</li>
            <li>Security information, including CAPTCHA tokens, used to prevent automated abuse.</li>
          </ul>
        ),
      },
      {
        title: "Where information is stored",
        content: (
          <>
            <p>Learner settings, deliberately saved phrases, custom cards, and activity dates and counts are stored on the device being used. Sentence text and selected card order stay in page memory and are discarded when the page is refreshed or closed. Previously stored sentence details are removed when the updated app opens. Parent account records, access rights, and feature-use counts are stored with Supabase.</p>
            <p>Device storage is not encrypted by Expressly. Anyone with access to the browser profile may be able to read saved device data. Device-only information may be lost if browser data is cleared or the device is replaced. Expressly will update this policy before enabling broader cloud synchronization.</p>
          </>
        ),
      },
      {
        title: "Services used to provide features",
        content: (
          <ul className="list-disc space-y-2 pl-5">
            <li>Supabase provides parent authentication and protected account records.</li>
            <li>Google Gemini receives selected card words only when grammar correction is requested.</li>
            <li>ElevenLabs receives sentence text only when enhanced voice is requested. Expressly streams the resulting audio and does not keep replay recordings.</li>
            <li>Replicate receives a written image prompt only when custom image generation is requested.</li>
            <li>Cloudflare Turnstile and Supabase receive security information used to prevent automated account abuse.</li>
          </ul>
        ),
      },
      {
        title: "What Expressly does not do",
        content: <p>Expressly does not sell personal information. The current app does not contain advertising, cross-app tracking, behavioral analytics, location collection, contact collection, or camera and microphone access.</p>,
      },
      {
        title: "Children's privacy",
        content: <p>Expressly is designed to support learners, including children, while the account is managed by an authorized adult. Expressly does not ask a child to create an account or provide an email address. Additional parental-consent safeguards will be completed before collecting personal information directly from children under 13.</p>,
      },
      {
        title: "Your choices and deletion",
        content: <p>Parents and caregivers can download a copy of their Expressly data, change learner settings, clear device data, or delete the parent account from within Expressly. Account deletion is designed to remove the authenticated account, its linked server records, private stored files, and that account's cached device data.</p>,
      },
      {
        title: "Retention and security",
        content: <p>Cloud feature providers may retain submitted content under their own terms and account settings. Expressly does not promise zero retention by these providers. Expressly keeps information only while it is needed to provide and secure the service. Protected server features require authentication, private database records use account-level access rules, and private service keys are kept off the user's device. No online service can promise absolute security.</p>,
      },
      {
        title: "Tracking signals",
        content: <p>Expressly does not currently track people across unrelated websites or apps. Because that tracking is not performed, browser Do Not Track signals do not change the app's behavior.</p>,
      },
      {
        title: "Questions or requests",
        content: <p>Until a permanent privacy email is established, parents and caregivers can contact the Expressly team through the Feedback option inside the app. A dedicated privacy contact will be added before public paid launch.</p>,
      },
    ]}
  />
);

export default Privacy;
