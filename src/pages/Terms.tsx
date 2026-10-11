import { LegalPage } from "@/components/LegalPage";

const Terms = () => (
  <LegalPage
    title="Terms of Use"
    summary="These terms describe the basic rules for creating an account and using Expressly responsibly."
    sections={[
      {
        title: "Account responsibility",
        content: <p>The person creating a parent account must be an adult authorized to manage the account. Keep login information private and tell the Expressly team if you believe the account has been accessed without permission.</p>,
      },
      {
        title: "What Expressly provides",
        content: <p>Expressly is an augmentative and alternative communication tool that helps users choose pictures, build messages, and share them. Features may include grammar correction, generated images, spoken output, customization, and progress summaries.</p>,
      },
      {
        title: "Not medical or emergency care",
        content: <p>Expressly does not provide medical advice, diagnosis, treatment, or emergency assistance. It does not replace a speech-language pathologist, physician, therapist, teacher, caregiver, or emergency service. Call the appropriate emergency service when immediate help is needed.</p>,
      },
      {
        title: "Responsible use",
        content: (
          <ul className="list-disc space-y-2 pl-5">
            <li>Do not use Expressly to harm, threaten, deceive, exploit, or impersonate another person.</li>
            <li>Do not attempt to bypass security, access another account, overload the service, or misuse paid features.</li>
            <li>Only upload words, images, and other content you have permission to use.</li>
            <li>Supervise the learner when appropriate for their age, needs, and environment.</li>
          </ul>
        ),
      },
      {
        title: "Generated and corrected content",
        content: <p>Automated grammar, image, and voice features can make mistakes. A parent, caregiver, educator, or professional should review generated content when accuracy or safety matters.</p>,
      },
      {
        title: "Your content",
        content: <p>You keep ownership of content you upload. You give Expressly permission to process that content only as needed to provide, secure, and improve the requested feature. Do not upload confidential information unless it is necessary for communication.</p>,
      },
      {
        title: "Availability and changes",
        content: <p>Expressly may update, limit, suspend, or discontinue features to improve safety, reliability, or legal compliance. Internet-based features may occasionally be unavailable, but the team will work to restore them promptly.</p>,
      },
      {
        title: "Ending an account",
        content: <p>You may stop using Expressly or delete the parent account from within the app. Expressly may restrict an account that abuses the service, threatens other users, creates unreasonable costs, or violates these terms.</p>,
      },
      {
        title: "Important limitation",
        content: <p>Expressly is provided as a communication-support service. To the extent permitted by law, the Expressly team is not responsible for losses caused by misuse, interrupted access, inaccurate generated content, or relying on the service for medical or emergency decisions.</p>,
      },
      {
        title: "Questions",
        content: <p>Questions about these terms can be submitted through the Feedback option inside Expressly. A permanent legal contact will be added before public paid launch.</p>,
      },
    ]}
  />
);

export default Terms;

