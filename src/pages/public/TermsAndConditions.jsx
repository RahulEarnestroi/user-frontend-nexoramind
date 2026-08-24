import { motion } from 'framer-motion';
import { FileText, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const sections = [
  {
    title: '1. About NexoraMind',
    content: `NexoraMind provides structured practical learning and internship-oriented programs across technology roles. Participants may select a technology track, complete company-defined tasks, submit their work for review, receive feedback, and become eligible for an internship completion certificate upon satisfying the applicable program requirements.

NexoraMind may also offer certification programs and other educational services. These Terms apply to all such services unless additional or separate terms are presented for a specific program or service.

NexoraMind reserves the right to modify, update, or discontinue any aspect of its services at any time. Where material changes are made, NexoraMind may make reasonable efforts to notify registered participants through email, platform notifications, or updates on the website.`
  },
  {
    title: '2. Eligibility',
    content: `NexoraMind services are primarily intended for students, graduates, and other individuals seeking practical technology experience. By registering for a NexoraMind program, you confirm that:

* You are eligible for the program you are applying to.
* You have the legal capacity to agree to these Terms.
* You are not subject to any restriction that would prevent you from participating in a NexoraMind program or receiving a certificate.
* You will not misrepresent your identity, qualifications, or circumstances.

NexoraMind reserves the right to verify eligibility information and to suspend or revoke access where eligibility requirements are not satisfied or where false or misleading information is provided.`
  },
  {
    title: '3. Program Registration',
    content: `Registration or application does not by itself constitute successful completion of an internship program. After registration, participants may be required to:

* Select an available technology track or internship role.
* Complete assigned practical tasks.
* Build and document the required solutions.
* Submit the required GitHub repository.
* Respond to review feedback.
* Obtain approval from the NexoraMind review team.
* Complete any applicable certificate process.

NexoraMind does not guarantee that every registered participant will be approved for or issued a certificate. Issuance of a certificate is subject to satisfactory completion of all applicable program requirements and review criteria.`
  },
  {
    title: '4. Practical Tasks and Submissions',
    content: `Participants are responsible for completing their assigned work honestly and independently. Submitted work must:

* Be substantially created by the participant.
* Follow the instructions of the assigned task.
* Not knowingly contain malicious code or unlawful material.
* Not infringe upon the intellectual property rights of any third party.
* Not contain confidential information belonging to an employer, client, or any other third party.

NexoraMind is not responsible for any consequences resulting from a participant's decision to submit code or materials that belong to a third party or that may violate confidentiality obligations.`
  },
  {
    title: '5. Review and Approval',
    content: `NexoraMind may review submitted projects, source code, documentation, implementation quality, and adherence to task requirements. A submission may be:

* Approved.
* Returned for revision.
* Rejected if it does not satisfy the applicable requirements.

NexoraMind may provide comments, suggestions, or feedback. Such feedback does not guarantee future approval or certificate issuance. Participants are expected to revise and resubmit work where necessary.

NexoraMind reserves the right to apply review standards consistently across participants and to update review criteria as needed.`
  },
  {
    title: '6. Internship Completion and Certification',
    content: `Completion of a NexoraMind internship program is subject to meeting all applicable requirements, which may include:

* Completing assigned practical tasks.
* Obtaining approval from the NexoraMind review team.
* Successfully completing a final project or Capstone Project, if applicable.
* Following the required certificate-request process.

NexoraMind does not guarantee employment, placement, or any particular outcome resulting from participation in or completion of a NexoraMind internship program.

Certificates issued by NexoraMind confirm completion of the applicable program requirements. NexoraMind may offer certificate verification functionality through its platform.`
  },
  {
    title: '7. Certificate Request and Issuance',
    content: `Where certificate issuance is available, participants may be required to:

* Submit a certificate request through the NexoraMind platform.
* Provide accurate personal information for certificate processing.
* Complete any required verification steps.
* Follow the applicable process within the required timeframe.

Once issued, a certificate is generally final. NexoraMind may decline to reissue or modify a certificate where:

* The information provided by the participant was inaccurate or incomplete.
* The certificate was obtained through misrepresentation, fraud, or a violation of these Terms.
* The participant failed to follow the applicable process.
* Program requirements were not satisfied.
* A reissue is not technically or administratively feasible.

NexoraMind reserves the right to revoke a certificate where it determines that the certificate was issued in error or based on false or misleading information.`
  },
  {
    title: '8. Participant Responsibilities',
    content: `Participants are expected to:

* Maintain accurate and up-to-date registration information.
* Complete their work honestly and independently.
* Not share account access with unauthorized individuals.
* Not engage in cheating, impersonation, unauthorized collaboration, or misrepresentation.
* Not attempt to access or interfere with other participants' accounts or data.
* Not use NexoraMind services for unlawful or harmful purposes.
* Not misrepresent a NexoraMind certificate, internship completion, or relationship with NexoraMind.
* Comply with all applicable laws and regulations.

Violations of this section may result in suspension, termination, certificate revocation, or other appropriate action.`
  },
  {
    title: '9. Acceptable Use',
    content: `Participants must not use NexoraMind services to:

* Send spam, malware, phishing attempts, or other harmful content.
* Infringe intellectual property rights.
* Conduct unauthorized data collection or surveillance.
* Impersonate another person or entity.
* Facilitate fraud, deception, or unlawful activity.
* Bypass security measures or access controls.
* Circumvent review or verification systems.
* Misrepresent identity, credentials, or program participation.

NexoraMind may investigate suspected violations and take appropriate action, including suspension or termination of access.`
  },
  {
    title: '10. Privacy',
    content: `NexoraMind collects and processes personal information in accordance with its Privacy Policy. By using NexoraMind services, you acknowledge that you have reviewed the Privacy Policy and agree to the collection, use, and processing of your information as described therein.

NexoraMind may use participant information for account management, program administration, certificate issuance, communications, security, fraud prevention, analytics, legal compliance, and service improvement.

Participants are responsible for ensuring that any personal or sensitive information they submit through NexoraMind services, including GitHub repository links, does not expose information that should remain confidential.`
  },
  {
    title: '11. Intellectual Property',
    content: `NexoraMind retains ownership of its platform, branding, course structure, instructional materials, templates, documentation, code samples, logos, trademarks, and other proprietary content unless otherwise stated.

Participants retain ownership of the original work they create during a NexoraMind program, subject to any separate agreement, licensing terms, or applicable program rules.

By submitting work to NexoraMind, participants grant NexoraMind a limited license to review, evaluate, verify, and display the submitted work for purposes related to program administration, certificate issuance, and verification.

NexoraMind does not acquire ownership of a participant's personal projects or code solely because the participant submits them for review.`
  },
  {
    title: '12. Fees and Payments',
    content: `Certain NexoraMind programs, services, or features may require payment. Where fees apply:

* Fee details, including amount, applicable taxes, and payment terms, will be presented before purchase or registration.
* Payment may be processed through third-party payment providers.
* NexoraMind may receive transaction confirmations such as payment status, reference details, amount, and date.
* Unless expressly stated otherwise or required by applicable law, fees are non-refundable once the relevant service or program access has been provided.

NexoraMind reserves the right to change fees at any time. Fee changes will not affect orders already confirmed and paid for.

Participants are responsible for reviewing applicable fees before completing a transaction.`
  },
  {
    title: '13. Disclaimers',
    content: `Unless otherwise stated, NexoraMind services are provided on an "as available" and "as is" basis. NexoraMind makes reasonable efforts to provide reliable and useful services, but does not guarantee uninterrupted operation, complete accuracy, or error-free performance of the platform.

NexoraMind does not guarantee:

* Specific career, employment, placement, or income outcomes.
* Acceptance or recognition of certificates by any particular employer, institution, government body, or third party.
* Uninterrupted or error-free operation of the platform.
* That services will meet every individual expectation.

Participants remain solely responsible for how they use the knowledge, skills, and certificates obtained through NexoraMind services.`
  },
  {
    title: '14. Limitation of Liability',
    content: `To the maximum extent permitted by applicable law, NexoraMind shall not be liable for any indirect, incidental, special, consequential, exemplary, or punitive damages, including loss of data, loss of opportunity, reputational harm, or business interruption, arising out of or related to participation in a NexoraMind program, use of NexoraMind services, or these Terms.

NexoraMind's total liability for claims arising out of or related to these Terms or the use of NexoraMind services shall not exceed the fees paid by the participant to NexoraMind for the applicable service giving rise to the claim, or where no fees were paid, the amount of Rs. 1,000.

These limitations apply regardless of the legal theory on which a claim is based and even if NexoraMind has been advised of the possibility of such damages.`
  },
  {
    title: '15. Indemnification',
    content: `To the extent permitted by applicable law, participants agree to indemnify and hold harmless NexoraMind, its operators, affiliates, and representatives from any claims, liabilities, damages, losses, or expenses arising out of or related to:

* The participant's use of NexoraMind services.
* The participant's violation of these Terms.
* The participant's violation of any law or third-party rights.
* Content submitted by the participant.

This section does not apply to the extent prohibited by applicable law.`
  },
  {
    title: '16. Suspension and Termination',
    content: `NexoraMind may suspend or limit access to its services where it reasonably believes that:

* A participant has violated these Terms or any applicable program rules.
* A participant has provided false or misleading information.
* A participant's conduct creates risk, harm, or potential liability.
* Suspension is required for maintenance, security, or operational reasons.

NexoraMind may terminate access where a violation is serious, repeated, or unresolved. Participants may also request account closure by contacting NexoraMind.

Upon termination:

* Access to services may be discontinued.
* Pending certificate requests may be canceled unless issuance has already been completed.
* Relevant records may be retained in accordance with NexoraMind's data practices and applicable law.`
  },
  {
    title: '17. Dispute Resolution',
    content: `Any dispute arising out of or related to these Terms or the use of NexoraMind services shall first be attempted to be resolved through good-faith discussion with NexoraMind.

Where a dispute cannot be resolved informally, such dispute shall be resolved in accordance with applicable law.

Participants agree to make reasonable efforts to resolve disputes with NexoraMind before pursuing external remedies.

If any dispute arises between NexoraMind and a participant regarding these Terms or the services, the parties shall attempt to resolve the matter amicably before initiating any formal proceedings.

Where informal resolution fails, disputes shall be resolved through arbitration in accordance with applicable law, unless a different forum is required by applicable regulations.`
  },
  {
    title: '18. Modification of Terms',
    content: `NexoraMind may update or modify these Terms from time to time. Where material changes are made, NexoraMind will make reasonable efforts to provide notice through email, platform notifications, or updates on the website.

Continued use of NexoraMind services after such changes become effective constitutes acceptance of the modified Terms. If a participant does not agree with the updated Terms, the participant should discontinue use of NexoraMind services.

Participants are encouraged to review these Terms periodically.`
  },
  {
    title: '19. Governing Law',
    content: `Unless otherwise required by applicable law, these Terms shall be governed by and construed in accordance with the laws of India. Subject to the dispute resolution provisions above, the courts at Bangalore shall have jurisdiction over matters arising out of or related to these Terms.`
  },
  {
    title: '20. Severability',
    content: `If any provision of these Terms is found to be invalid, illegal, or unenforceable, the remaining provisions shall continue in full force and effect. The invalid or unenforceable provision shall be modified to the minimum extent necessary to make it valid and enforceable while preserving its original intent.`
  },
  {
    title: '21. Entire Agreement',
    content: `These Terms, together with the Privacy Policy and any additional terms applicable to specific programs or services, constitute the entire agreement between the participant and NexoraMind regarding the subject matter hereof and supersede all prior or contemporaneous agreements, understandings, communications, and proposals, whether oral or written, relating to such subject matter.`
  },
  {
    title: '22. Contact Us',
    content: `For any questions, requests, or concerns regarding these Terms, please contact:

NexoraMind
Website: NexoraMind.tech
Email: info@nexoramind.tech`
  },
  {
    title: '23. Acknowledgement',
    content: `By using NexoraMind services, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.

If you do not agree to these Terms, please do not use NexoraMind services.`
  }
];

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
};

export default function TermsAndConditions() {
  return (
    <div className="py-20 bg-white dark:bg-black min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-12">
        <Link to="/" className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-primary-50 dark:bg-primary-500/10 border border-primary-100 dark:border-primary-500/20 flex items-center justify-center">
              <FileText className="w-7 h-7 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 text-xs font-semibold mb-2 border border-primary-100 dark:border-primary-500/15 tracking-wide uppercase">
                Legal Document
              </span>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">Terms &amp; Conditions</h1>
            </div>
          </div>
        </motion.div>

        <motion.div variants={container} initial="hidden" animate="visible" className="space-y-5">
          {sections.map((s, i) => (
            <motion.div key={i} variants={item} className="p-6 sm:p-8 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:border-white/[0.1] transition-all duration-300">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">{s.title}</h2>
              <div className="text-slate-600 dark:text-white/50 leading-relaxed text-sm whitespace-pre-line">{s.content}</div>
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-12 text-center text-slate-400 dark:text-white/25 text-xs">
          If you have questions about these Terms, contact us at{' '}
          <a href="mailto:info@nexoramind.tech" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">info@nexoramind.tech</a>
        </div>
      </div>
    </div>
  );
}
