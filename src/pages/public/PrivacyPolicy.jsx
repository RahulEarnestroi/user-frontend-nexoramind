import { motion } from 'framer-motion';
import { Shield, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const sections = [
  {
    title: '1. Information We May Collect',
    content: `Depending on how you use NexoraMind, we may collect information such as:

Personal Information:
* Full name
* Email address
* Phone number, where provided
* Date of birth or other information where required for program administration
* Educational or academic information
* College or institution details
* Selected internship or technology track
* Internship duration and program information

Program Information:
We may collect information relating to your participation, including:
* Registration details
* Selected role
* Assigned tasks
* Task submissions
* GitHub or other portfolio links
* Review results
* Feedback
* Completion status
* Certificate information

Payment Information:
Where paid services are provided, payment-related information may be processed through the applicable payment provider. NexoraMind may receive transaction information such as payment status, transaction reference, amount, and date. We do not intend to require participants to submit unnecessary payment-card credentials directly to NexoraMind.`
  },
  {
    title: '2. Information You Submit Through GitHub',
    content: `Some NexoraMind programs require participants to submit public GitHub repositories as evidence of their practical work.

Participants should ensure that public repositories do not contain:
* Passwords
* API keys
* Authentication tokens
* Private credentials
* Confidential employer or client information
* Other sensitive personal information

NexoraMind may access and review the submitted repository for program evaluation and verification purposes.`
  },
  {
    title: '3. How We Use Information',
    content: `NexoraMind may use collected information to:
* Create and manage participant accounts.
* Process internship applications.
* Administer selected internship programs.
* Assign and track practical tasks.
* Review submitted work.
* Provide feedback.
* Verify program completion.
* Process applicable certificate requests.
* Generate and issue certificates.
* Communicate with participants regarding their program.
* Respond to support requests.
* Process payments through applicable payment providers.
* Maintain platform security.
* Detect fraud, abuse, cheating, or unauthorized activity.
* Improve our programs, services, and user experience.
* Comply with applicable legal obligations.`
  },
  {
    title: '4. Certificate and Verification Information',
    content: `Where a participant successfully completes the applicable requirements, NexoraMind may generate an internship completion certificate.

Certificate records may contain information such as the participant's name, internship role, duration, dates, certificate number, and completion information.

Where NexoraMind provides certificate verification functionality, information necessary to verify the authenticity of a certificate may be made available through the applicable verification system.`
  },
  {
    title: '5. Communications',
    content: `We may use your contact information to communicate with you about:
* Registration
* Internship tasks
* Reviews and feedback
* Program progress
* Certificate processing
* Account or security matters
* Support requests
* Important service updates

Where required by applicable law, marketing communications will be handled in accordance with applicable consent and opt-out requirements.`
  },
  {
    title: '6. Third-Party Services',
    content: `NexoraMind may use third-party services to operate parts of its platform, such as:
* Payment processing services
* Cloud hosting and infrastructure
* Email or communication services
* Authentication services
* GitHub or other submission platforms
* Analytics or security services

These providers may process information on NexoraMind's behalf or independently according to their applicable terms and privacy policies.

We aim to share only information reasonably necessary for the relevant service or purpose.`
  },
  {
    title: '7. Data Security',
    content: `NexoraMind takes reasonable technical and organizational measures to protect personal information against unauthorized access, misuse, alteration, disclosure, or destruction.

However, no internet-based service can guarantee absolute security.

Participants should also protect their passwords, account credentials, API keys, and other confidential information.`
  },
  {
    title: '8. Data Retention',
    content: `NexoraMind may retain personal information for as long as reasonably necessary to:
* Provide and administer services;
* Maintain internship and certificate records;
* Verify program completion;
* Resolve disputes;
* Prevent fraud and abuse;
* Meet legal, accounting, or regulatory requirements.

Specific retention periods may vary depending on the type of information and applicable legal requirements.`
  },
  {
    title: '9. Your Rights',
    content: `Subject to applicable law, you may have rights relating to your personal information, including the ability to:
* Request access to certain personal information.
* Request correction of inaccurate information.
* Request deletion where legally applicable.
* Withdraw consent where processing is based on consent.
* Raise concerns regarding the processing of your personal information.

Requests may be submitted using the contact details provided below.`
  },
  {
    title: "10. Children's Privacy",
    content: `NexoraMind's programs are primarily intended for students, graduates, and other eligible participants.

If a participant is below the applicable age of consent under relevant law, participation may require appropriate parental or guardian involvement.

If we become aware that personal information has been collected in violation of applicable requirements, we may take appropriate steps to address the situation.`
  },
  {
    title: '11. Cookies and Similar Technologies',
    content: `NexoraMind may use cookies or similar technologies to support website functionality, security, preferences, analytics, and service improvement.

Where required by applicable law, appropriate consent mechanisms may be provided.`
  },
  {
    title: '12. External Links',
    content: `The NexoraMind website or program materials may contain links to third-party websites or services.

NexoraMind is not responsible for the privacy practices of external websites. Users should review the privacy policies of third-party services before providing them with personal information.`
  },
  {
    title: '13. International Processing',
    content: `Depending on the technology providers and infrastructure used by NexoraMind, personal information may be processed or stored in locations outside the participant's country.

Where applicable, NexoraMind will take reasonable steps to handle such processing in accordance with applicable privacy and data-protection requirements.`
  },
  {
    title: '14. Changes to This Privacy Policy',
    content: `NexoraMind may update this Privacy Policy from time to time to reflect changes in our services, technology, or legal requirements.

The updated policy will be published on the NexoraMind website with the revised "Last Updated" date.`
  },
  {
    title: '15. Contact Us',
    content: `If you have questions, requests, or concerns regarding this Privacy Policy or your personal information, please contact:

NexoraMind
Website: NexoraMind.tech
Privacy Email: info@nexoramind.tech`
  },
  {
    title: '16. Acknowledgement',
    content: `By using NexoraMind services, you acknowledge that you have read and understood this Privacy Policy.

Where applicable law requires consent for a particular processing activity, NexoraMind will obtain such consent through the appropriate mechanism.`
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

export default function PrivacyPolicy() {
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
              <Shield className="w-7 h-7 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 text-xs font-semibold mb-2 border border-primary-100 dark:border-primary-500/15 tracking-wide uppercase">
                Legal Document
              </span>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">Privacy Policy</h1>
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
          For privacy-related inquiries, contact us at{' '}
          <a href="mailto:info@nexoramind.tech" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">info@nexoramind.tech</a>
        </div>
      </div>
    </div>
  );
}
