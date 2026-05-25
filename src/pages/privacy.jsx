import React from 'react'
import { LegalDocLayout } from '../components/LegalDocLayout'

const PRIVACY_TOC = [
  { id: 'section-intro', label: 'Introduction' },
  { id: 'section-summary', label: 'Summary of key points' },
  { id: 'section-toc', label: 'Table of contents' },
  { id: 'section-1', label: 'What information we collect' },
  { id: 'section-2', label: 'How we process your information' },
  { id: 'section-3', label: 'Legal bases for processing' },
  { id: 'section-4', label: 'When we share personal information' },
  { id: 'section-5', label: 'Cookies and tracking' },
  { id: 'section-6', label: 'How long we keep information' },
  { id: 'section-7', label: 'How we keep information safe' },
  { id: 'section-8', label: 'Information from minors' },
  { id: 'section-9', label: 'Your privacy rights' },
  { id: 'section-10', label: 'Do-not-track' },
  { id: 'section-11', label: 'U.S. resident rights' },
  { id: 'section-12', label: 'Updates to this notice' },
  { id: 'section-13', label: 'Contact us about this notice' },
  { id: 'section-14', label: 'Review, update, or delete data' },
]

const PrivacyPolicy = () => {
  return (
    <LegalDocLayout
      title="Privacy Policy"
      path="/privacy"
      lastUpdated="February 10, 2025"
      effectiveDate="February 10, 2025"
      tocItems={PRIVACY_TOC}
    >
            {/* Introduction */}
            <div id="section-intro" className="mb-8">
              <p className="text-slate-700 leading-relaxed mb-4">
              This Privacy Policy aims to inform you, in accordance with the regulations in force on the protection of personal data (referring to Law No. 09-08 on the protection of individuals with regard to the processing of personal data), of the conditions under which EPINEON processes your personal data. EPINEON collects and processes your personal data for the purpose of customer management. As part of its activities, EPINEON only requests the following information: (name, first name, and email address,). This processing has been declared to the CNDP under the number D-W-401/2025.
              </p>
              <p className="text-slate-700 leading-relaxed">
                <strong>Questions or concerns?</strong> Reading this Privacy Notice will help you understand your privacy rights and choices. We are responsible for making decisions about how your personal information is processed. If you do not agree with our policies and practices, please do not use our Services. If you still have any questions or concerns, please contact us at <a href="mailto:privacy@epineon.ai" className="text-[#3689e5] hover:underline">privacy@epineon.ai</a>.
              </p>
            </div>

            {/* Summary of Key Points */}
            <section id="section-summary" className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">SUMMARY OF KEY POINTS</h2>
              <p className="text-slate-700 mb-4">
                This summary provides key points from our Privacy Notice, but you can find out more details about any of these topics by clicking the link following each key point or by using our table of contents below to find the section you are looking for.
              </p>
              
              <div className="space-y-4 text-slate-700">
                <div>
                  <strong>What personal information do we process?</strong> When you visit, use, or navigate our Services, we may process personal information depending on how you interact with us and the Services, the choices you make, and the products and features you use. Learn more about <a href="#section-1" className="text-[#3689e5] hover:underline">personal information you disclose to us</a>.
                </div>
                
                <div>
                  <strong>Do we process any sensitive personal information?</strong> Some of the information may be considered "special" or "sensitive" in certain jurisdictions, for example your racial or ethnic origins, sexual orientation, and religious beliefs. We do not process sensitive personal information.
                </div>
                
                <div>
                  <strong>Do we collect any information from third parties?</strong> We do not collect any information from third parties.
                </div>
                
                <div>
                  <strong>How do we process your information?</strong> We process your information to provide, improve, and administer our Services, communicate with you, for security and fraud prevention, and to comply with law. We may also process your information for other purposes with your consent. We process your information only when we have a valid legal reason to do so. Learn more about <a href="#section-2" className="text-[#3689e5] hover:underline">how we process your information</a>.
                </div>
                
                <div>
                  <strong>In what situations and with which parties do we share personal information?</strong> We may share information in specific situations and with specific third parties. Learn more about <a href="#section-4" className="text-[#3689e5] hover:underline">when and with whom we share your personal information</a>.
                </div>
                
                <div>
                  <strong>How do we keep your information safe?</strong> We have adequate organizational and technical processes and procedures in place to protect your personal information. However, no electronic transmission over the internet or information storage technology can be guaranteed to be 100% secure, so we cannot promise or guarantee that hackers, cybercriminals, or other unauthorized third parties will not be able to defeat our security and improperly collect, access, steal, or modify your information. Learn more about <a href="#section-7" className="text-[#3689e5] hover:underline">how we keep your information safe</a>.
                </div>
                
                <div>
                  <strong>What are your rights?</strong> Depending on where you are located geographically, the applicable privacy law may mean you have certain rights regarding your personal information. Learn more about <a href="#section-9" className="text-[#3689e5] hover:underline">your privacy rights</a>.
                </div>
                
                <div>
                  <strong>How do you exercise your rights?</strong> The easiest way to exercise your rights is by visiting __________, or by contacting us. We will consider and act upon any request in accordance with applicable data protection laws.
                </div>
                
                <div>
                  <strong>Want to learn more about what we do with any information we collect?</strong> Review the Privacy Notice in full.
                </div>
              </div>
            </section>

            {/* Table of Contents */}
            <section id="section-toc" className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">TABLE OF CONTENTS</h2>
              <ol className="list-decimal list-inside text-slate-700 space-y-2">
                <li><a href="#section-1" className="text-[#3689e5] hover:underline">WHAT INFORMATION DO WE COLLECT?</a></li>
                <li><a href="#section-2" className="text-[#3689e5] hover:underline">HOW DO WE PROCESS YOUR INFORMATION?</a></li>
                <li><a href="#section-3" className="text-[#3689e5] hover:underline">WHAT LEGAL BASES DO WE RELY ON TO PROCESS YOUR PERSONAL INFORMATION?</a></li>
                <li><a href="#section-4" className="text-[#3689e5] hover:underline">WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?</a></li>
                <li><a href="#section-5" className="text-[#3689e5] hover:underline">DO WE USE COOKIES AND OTHER TRACKING TECHNOLOGIES?</a></li>
                <li><a href="#section-6" className="text-[#3689e5] hover:underline">HOW LONG DO WE KEEP YOUR INFORMATION?</a></li>
                <li><a href="#section-7" className="text-[#3689e5] hover:underline">HOW DO WE KEEP YOUR INFORMATION SAFE?</a></li>
                <li><a href="#section-8" className="text-[#3689e5] hover:underline">DO WE COLLECT INFORMATION FROM MINORS?</a></li>
                <li><a href="#section-9" className="text-[#3689e5] hover:underline">WHAT ARE YOUR PRIVACY RIGHTS?</a></li>
                <li><a href="#section-10" className="text-[#3689e5] hover:underline">CONTROLS FOR DO-NOT-TRACK FEATURES</a></li>
                <li><a href="#section-11" className="text-[#3689e5] hover:underline">DO UNITED STATES RESIDENTS HAVE SPECIFIC PRIVACY RIGHTS?</a></li>
                <li><a href="#section-12" className="text-[#3689e5] hover:underline">DO WE MAKE UPDATES TO THIS NOTICE?</a></li>
                <li><a href="#section-13" className="text-[#3689e5] hover:underline">HOW CAN YOU CONTACT US ABOUT THIS NOTICE?</a></li>
                <li><a href="#section-14" className="text-[#3689e5] hover:underline">HOW CAN YOU REVIEW, UPDATE, OR DELETE THE DATA WE COLLECT FROM YOU?</a></li>
              </ol>
            </section>

            {/* Section 1 */}
            <section id="section-1" className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">1. WHAT INFORMATION DO WE COLLECT?</h2>
              
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Personal information you disclose to us</h3>
              <p className="text-slate-700 mb-4">
                <strong>In Short:</strong> We collect personal information that you provide to us.
              </p>
              
              <p className="text-slate-700 mb-4">
                We collect personal information that you voluntarily provide to us when you express an interest in obtaining information about us or our products and Services, when you participate in activities on the Services, or otherwise when you contact us.
              </p>
              
              <p className="text-slate-700 mb-4">
                <strong>Personal Information Provided by You.</strong> The personal information that we collect depends on the context of your interactions with us and the Services, the choices you make, and the products and features you use. The personal information we collect may include the following:
              </p>
              <ul className="list-disc list-inside text-slate-700 ml-4 mb-4">
                <li>names</li>
                <li>email addresses</li>
              </ul>
              
              <p className="text-slate-700 mb-4">
                <strong>Sensitive Information.</strong> We do not process sensitive information.
              </p>
              
              <p className="text-slate-700">
                All personal information that you provide to us must be true, complete, and accurate, and you must notify us of any changes to such personal information.
              </p>
            </section>

            {/* Section 2 */}
            <section id="section-2" className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">2. HOW DO WE PROCESS YOUR INFORMATION?</h2>
              
              <p className="text-slate-700 mb-4">
                <strong>In Short:</strong> We process your information to provide, improve, and administer our Services, communicate with you, for security and fraud prevention, and to comply with law. We may also process your information for other purposes with your consent.
              </p>
              
              <p className="text-slate-700 mb-4">
                We process your personal information for a variety of reasons, depending on how you interact with our Services, including:
              </p>
              
              <ul className="list-disc list-inside text-slate-700 ml-4 space-y-2">
                <li><strong>To request feedback.</strong> We may process your information when necessary to request feedback and to contact you about your use of our Services.</li>
                
                <li><strong>To send you marketing and promotional communications.</strong> We may process the personal information you send to us for our marketing purposes, if this is in accordance with your marketing preferences. You can opt out of our marketing emails at any time. For more information, see "WHAT ARE YOUR PRIVACY RIGHTS?" below.</li>
                
                <li><strong>To deliver targeted advertising to you.</strong> We may process your information to develop and display personalized content and advertising tailored to your interests, location, and more. For more information see our <a href="https://epineon.ai/cookie-policy/" className="text-[#3689e5] hover:underline">Cookie Notice</a>.</li>
                
                <li><strong>To save or protect an individual's vital interest.</strong> We may process your information when necessary to save or protect an individual's vital interest, such as to prevent harm.</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section id="section-3" className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">3. WHAT LEGAL BASES DO WE RELY ON TO PROCESS YOUR INFORMATION?</h2>
              
              <p className="text-slate-700 mb-4">
                <strong>In Short:</strong> We only process your personal information when we believe it is necessary and we have a valid legal reason (i.e., legal basis) to do so under applicable law, like with your consent, to comply with laws, to provide you with services to enter into or fulfill our contractual obligations, to protect your rights, or to fulfill our legitimate business interests.
              </p>
              
              <p className="text-slate-700 mb-4">
                <strong>If you are located in the EU or UK, this section applies to you.</strong>
              </p>
              
              <p className="text-slate-700 mb-4">
                The General Data Protection Regulation (GDPR) and UK GDPR require us to explain the valid legal bases we rely on in order to process your personal information. As such, we may rely on the following legal bases to process your personal information:
              </p>
              
              <ul className="list-disc list-inside text-slate-700 ml-4 space-y-2">
                <li><strong>Consent.</strong> We may process your information if you have given us permission (i.e., consent) to use your personal information for a specific purpose. You can withdraw your consent at any time. Learn more about <a href="#section-9" className="text-[#3689e5] hover:underline">withdrawing your consent</a>.</li>
                
                <li><strong>Legitimate Interests.</strong> We may process your information when we believe it is reasonably necessary to achieve our legitimate business interests and those interests do not outweigh your interests and fundamental rights and freedoms. For example, we may process your personal information for some of the purposes described in order to:
                  <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                    <li>Send users information about special offers and discounts on our products and services</li>
                    <li>Develop and display personalized and relevant advertising content for our users</li>
                    <li>Understand how our users use our products and services so we can improve user experience</li>
                  </ul>
                </li>
                
                <li><strong>Legal Obligations.</strong> We may process your information where we believe it is necessary for compliance with our legal obligations, such as to cooperate with a law enforcement body or regulatory agency, exercise or defend our legal rights, or disclose your information as evidence in litigation in which we are involved.</li>
                
                <li><strong>Vital Interests.</strong> We may process your information where we believe it is necessary to protect your vital interests or the vital interests of a third party, such as situations involving potential threats to the safety of any person.</li>
              </ul>
              
              <p className="text-slate-700 mb-4 mt-6">
                <strong>If you are located in Canada, this section applies to you.</strong>
              </p>
              
              <p className="text-slate-700 mb-4">
                We may process your information if you have given us specific permission (i.e., express consent) to use your personal information for a specific purpose, or in situations where your permission can be inferred (i.e., implied consent). You can withdraw your consent at any time.
              </p>
              
              <p className="text-slate-700 mb-4">
                In some exceptional cases, we may be legally permitted under applicable law to process your information without your consent, including, for example:
              </p>
              
              <ul className="list-disc list-inside text-slate-700 ml-4 space-y-2">
                <li>If collection is clearly in the interests of an individual and consent cannot be obtained in a timely way</li>
                <li>For investigations and fraud detection and prevention</li>
                <li>For business transactions provided certain conditions are met</li>
                <li>If it is contained in a witness statement and the collection is necessary to assess, process, or settle an insurance claim</li>
                <li>For identifying injured, ill, or deceased persons and communicating with next of kin</li>
                <li>If we have reasonable grounds to believe an individual has been, is, or may be victim of financial abuse</li>
                <li>If it is reasonable to expect collection and use with consent would compromise the availability or the accuracy of the information and the collection is reasonable for purposes related to investigating a breach of an agreement or a contravention of the laws of Canada or a province</li>
                <li>If disclosure is required to comply with a subpoena, warrant, court order, or rules of the court relating to the production of records</li>
                <li>If it was produced by an individual in the course of their employment, business, or profession and the collection is consistent with the purposes for which the information was produced</li>
                <li>If the collection is solely for journalistic, artistic, or literary purposes</li>
                <li>If the information is publicly available and is specified by the regulations</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section id="section-4" className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">4. WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?</h2>
              
              <p className="text-slate-700 mb-4">
                <strong>In Short:</strong> We may share information in specific situations described in this section and/or with the following third parties.
              </p>
              
              <p className="text-slate-700 mb-4">
                We may need to share your personal information in the following situations:
              </p>
              
              <ul className="list-disc list-inside text-slate-700 ml-4">
                <li><strong>Business Transfers.</strong> We may share or transfer your information in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business to another company.</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section id="section-5" className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">5. DO WE USE COOKIES AND OTHER TRACKING TECHNOLOGIES?</h2>
              
              <p className="text-slate-700 mb-4">
                <strong>In Short:</strong> We may use cookies and other tracking technologies to collect and store your information.
              </p>
              
              <p className="text-slate-700 mb-4">
                We may use cookies and similar tracking technologies (like web beacons and pixels) to gather information when you interact with our Services. Some online tracking technologies help us maintain the security of our Services, prevent crashes, fix bugs, save your preferences, and assist with basic site functions.
              </p>
              
              <p className="text-slate-700 mb-4">
                We also permit third parties and service providers to use online tracking technologies on our Services for analytics and advertising, including to help manage and display advertisements, to tailor advertisements to your interests, or to send abandoned shopping cart reminders (depending on your communication preferences). The third parties and service providers use their technology to provide advertising about products and services tailored to your interests which may appear either on our Services or on other websites.
              </p>
              
              <p className="text-slate-700 mb-4">
                To the extent these online tracking technologies are deemed to be a "sale"/"sharing" (which includes targeted advertising, as defined under the applicable laws) under applicable US state laws, you can opt out of these online tracking technologies by submitting a request as described below under section "DO UNITED STATES RESIDENTS HAVE SPECIFIC PRIVACY RIGHTS?"
              </p>
              
              <p className="text-slate-700">
                Specific information about how we use such technologies and how you can refuse certain cookies is set out in our Cookie Notice: __________.
              </p>
            </section>

            {/* Section 6 */}
            <section id="section-6" className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">6. HOW LONG DO WE KEEP YOUR INFORMATION?</h2>
              
              <p className="text-slate-700 mb-4">
                <strong>In Short:</strong> We keep your information for as long as necessary to fulfill the purposes outlined in this Privacy Notice unless otherwise required by law.
              </p>
              
              <p className="text-slate-700 mb-4">
                We will only keep your personal information for as long as it is necessary for the purposes set out in this Privacy Notice, unless a longer retention period is required or permitted by law (such as tax, accounting, or other legal requirements). No purpose in this notice will require us keeping your personal information for longer than 90 days.
              </p>
              
              <p className="text-slate-700">
                When we have no ongoing legitimate business need to process your personal information, we will either delete or anonymize such information, or, if this is not possible (for example, because your personal information has been stored in backup archives), then we will securely store your personal information and isolate it from any further processing until deletion is possible.
              </p>
            </section>

            {/* Section 7 */}
            <section id="section-7" className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">7. HOW DO WE KEEP YOUR INFORMATION SAFE?</h2>
              
              <p className="text-slate-700 mb-4">
                <strong>In Short:</strong> We aim to protect your personal information through a system of organizational and technical security measures.
              </p>
              
              <p className="text-slate-700">
                We have implemented appropriate and reasonable technical and organizational security measures designed to protect the security of any personal information we process. However, despite our safeguards and efforts to secure your information, no electronic transmission over the Internet or information storage technology can be guaranteed to be 100% secure, so we cannot promise or guarantee that hackers, cybercriminals, or other unauthorized third parties will not be able to defeat our security and improperly collect, access, steal, or modify your information. Although we will do our best to protect your personal information, transmission of personal information to and from our Services is at your own risk. You should only access the Services within a secure environment.
              </p>
            </section>

            {/* Section 8 */}
            <section id="section-8" className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">8. DO WE COLLECT INFORMATION FROM MINORS?</h2>
              
              <p className="text-slate-700 mb-4">
                <strong>In Short:</strong> We do not knowingly collect data from or market to children under 18 years of age.
              </p>
              
              <p className="text-slate-700">
                We do not knowingly collect, solicit data from, or market to children under 18 years of age, nor do we knowingly sell such personal information. By using the Services, you represent that you are at least 18 or that you are the parent or guardian of such a minor and consent to such minor dependent's use of the Services. If we learn that personal information from users less than 18 years of age has been collected, we will deactivate the account and take reasonable measures to promptly delete such data from our records. If you become aware of any data we may have collected from children under age 18, please contact us at <a href="mailto:y.bouamri@epinen.ai" className="text-[#3689e5] hover:underline">y.bouamri@epinen.ai</a>.
              </p>
            </section>

            {/* Section 9 */}
            <section id="section-9" className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">9. WHAT ARE YOUR PRIVACY RIGHTS?</h2>
              
              <p className="text-slate-700 mb-4">
                <strong>In Short:</strong> Depending on your state of residence in the US or in some regions, such as the European Economic Area (EEA), United Kingdom (UK), Switzerland, and Canada, you have rights that allow you greater access to and control over your personal information. You may review, change, or terminate your account at any time, depending on your country, province, or state of residence.
              </p>
              
              <p className="text-slate-700 mb-4">
                In some regions (like the EEA, UK, Switzerland, and Canada), you have certain rights under applicable data protection laws. These may include the right (i) to request access and obtain a copy of your personal information, (ii) to request rectification or erasure; (iii) to restrict the processing of your personal information; (iv) if applicable, to data portability; and (v) not to be subject to automated decision-making. In certain circumstances, you may also have the right to object to the processing of your personal information. You can make such a request by contacting us by using the contact details provided in the section "HOW CAN YOU CONTACT US ABOUT THIS NOTICE?" below.
              </p>
              
              <p className="text-slate-700 mb-4">
                We will consider and act upon any request in accordance with applicable data protection laws.
              </p>
              
              <p className="text-slate-700 mb-4">
                If you are located in the EEA or UK and you believe we are unlawfully processing your personal information, you also have the right to complain to your <a href="https://ec.europa.eu/justice/data-protection/bodies/authorities/index_en.htm" className="text-[#3689e5] hover:underline">Member State data protection authority</a> or <a href="https://ico.org.uk/make-a-complaint/data-protection-complaints/data-protection-complaints/" className="text-[#3689e5] hover:underline">UK data protection authority</a>.
              </p>
              
              <p className="text-slate-700 mb-4">
                If you are located in Switzerland, you may contact the <a href="https://www.edoeb.admin.ch/edoeb/en/home.html" className="text-[#3689e5] hover:underline">Federal Data Protection and Information Commissioner</a>.
              </p>
              
              <div className="space-y-4 text-slate-700">
                <div>
                  <strong>Withdrawing your consent:</strong> If we are relying on your consent to process your personal information, which may be express and/or implied consent depending on the applicable law, you have the right to withdraw your consent at any time. You can withdraw your consent at any time by contacting us by using the contact details provided in the section "HOW CAN YOU CONTACT US ABOUT THIS NOTICE?" below.
                </div>
                
                <div>
                  However, please note that this will not affect the lawfulness of the processing before its withdrawal nor, when applicable law allows, will it affect the processing of your personal information conducted in reliance on lawful processing grounds other than consent.
                </div>
                
                <div>
                  <strong>Opting out of marketing and promotional communications:</strong> You can unsubscribe from our marketing and promotional communications at any time by clicking on the unsubscribe link in the emails that we send, or by contacting us using the details provided in the section "HOW CAN YOU CONTACT US ABOUT THIS NOTICE?" below. You will then be removed from the marketing lists. However, we may still communicate with you — for example, to send you service-related messages that are necessary for the administration and use of your account, to respond to service requests, or for other non-marketing purposes.
                </div>
                
                <div>
                  <strong>Cookies and similar technologies:</strong> Most Web browsers are set to accept cookies by default. If you prefer, you can usually choose to set your browser to remove cookies and to reject cookies. If you choose to remove cookies or reject cookies, this could affect certain features or services of our Services. For further information, please see our Cookie Notice: __________.
                </div>
                
                <div>
                  If you have questions or comments about your privacy rights, you may email us at <a href="mailto:privacy@epineon.ai" className="text-[#3689e5] hover:underline">privacy@epineon.ai</a>.
                </div>
              </div>
            </section>

            {/* Section 10 */}
            <section id="section-10" className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">10. CONTROLS FOR DO-NOT-TRACK FEATURES</h2>
              
              <p className="text-slate-700 mb-4">
                Most web browsers and some mobile operating systems and mobile applications include a Do-Not-Track ("DNT") feature or setting you can activate to signal your privacy preference not to have data about your online browsing activities monitored and collected. At this stage, no uniform technology standard for recognizing and implementing DNT signals has been finalized. As such, we do not currently respond to DNT browser signals or any other mechanism that automatically communicates your choice not to be tracked online. If a standard for online tracking is adopted that we must follow in the future, we will inform you about that practice in a revised version of this Privacy Notice.
              </p>
              
              <p className="text-slate-700">
                California law requires us to let you know how we respond to web browser DNT signals. Because there currently is not an industry or legal standard for recognizing or honoring DNT signals, we do not respond to them at this time.
              </p>
            </section>

            {/* Section 11 */}
            <section id="section-11" className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">11. DO UNITED STATES RESIDENTS HAVE SPECIFIC PRIVACY RIGHTS?</h2>
              
              <p className="text-slate-700 mb-4">
                <strong>In Short:</strong> If you are a resident of California, Colorado, Connecticut, Delaware, Florida, Indiana, Iowa, Kentucky, Minnesota, Montana, Nebraska, New Hampshire, New Jersey, Oregon, Tennessee, Texas, Utah, or Virginia, you may have the right to request access to and receive details about the personal information we maintain about you and how we have processed it, correct inaccuracies, get a copy of, or delete your personal information. You may also have the right to withdraw your consent to our processing of your personal information. These rights may be limited in some circumstances by applicable law. More information is provided below.
              </p>
              
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Categories of Personal Information We Collect</h3>
              <p className="text-slate-700 mb-4">
                We have collected the following categories of personal information in the past twelve (12) months:
              </p>
              
              <div className="legal-doc-card-panel overflow-x-auto mb-4 p-4 lg:p-5">
                <table className="w-full border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="border border-slate-300 p-3 text-left font-semibold">Category</th>
                      <th className="border border-slate-300 p-3 text-left font-semibold">Examples</th>
                      <th className="border border-slate-300 p-3 text-left font-semibold">Collected</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-700">
                    <tr>
                      <td className="border border-slate-300 p-3">A. Identifiers</td>
                      <td className="border border-slate-300 p-3">Contact details, such as real name, alias, postal address, telephone or mobile contact number, unique personal identifier, online identifier, Internet Protocol address, email address, and account name</td>
                      <td className="border border-slate-300 p-3">NO</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 p-3">B. Personal information as defined in the California Customer Records statute</td>
                      <td className="border border-slate-300 p-3">Name, contact information, education, employment, employment history, and financial information</td>
                      <td className="border border-slate-300 p-3">YES</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 p-3">C. Protected classification characteristics under state or federal law</td>
                      <td className="border border-slate-300 p-3">Gender, age, date of birth, race and ethnicity, national origin, marital status, and other demographic data</td>
                      <td className="border border-slate-300 p-3">NO</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 p-3">D. Commercial information</td>
                      <td className="border border-slate-300 p-3">Transaction information, purchase history, financial details, and payment information</td>
                      <td className="border border-slate-300 p-3">NO</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 p-3">E. Biometric information</td>
                      <td className="border border-slate-300 p-3">Fingerprints and voiceprints</td>
                      <td className="border border-slate-300 p-3">NO</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 p-3">F. Internet or other similar network activity</td>
                      <td className="border border-slate-300 p-3">Browsing history, search history, online behavior, interest data, and interactions with our and other websites, applications, systems, and advertisements</td>
                      <td className="border border-slate-300 p-3">NO</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 p-3">G. Geolocation data</td>
                      <td className="border border-slate-300 p-3">Device location</td>
                      <td className="border border-slate-300 p-3">NO</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 p-3">H. Audio, electronic, sensory, or similar information</td>
                      <td className="border border-slate-300 p-3">Images and audio, video or call recordings created in connection with our business activities</td>
                      <td className="border border-slate-300 p-3">NO</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 p-3">I. Professional or employment-related information</td>
                      <td className="border border-slate-300 p-3">Business contact details in order to provide you our Services at a business level or job title, work history, and professional qualifications if you apply for a job with us</td>
                      <td className="border border-slate-300 p-3">NO</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 p-3">J. Education Information</td>
                      <td className="border border-slate-300 p-3">Student records and directory information</td>
                      <td className="border border-slate-300 p-3">NO</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mb-6 grid gap-4 md:grid-cols-2">
                <div className="legal-doc-card-panel p-4 lg:p-5">
                  <p className="mb-2 font-semibold text-slate-900">K. Inferences drawn from collected personal information</p>
                  <p className="mb-3 text-sm leading-relaxed text-slate-700">
                    Inferences drawn from any of the collected personal information listed above to create a profile or summary about, for example, an individual&apos;s preferences and characteristics
                  </p>
                  <p className="text-sm font-semibold text-slate-900">Collected: NO</p>
                </div>
                <div className="legal-doc-card-panel p-4 lg:p-5">
                  <p className="mb-2 font-semibold text-slate-900">L. Sensitive personal information</p>
                  <p className="mb-3 text-sm leading-relaxed text-slate-700">
                    Where applicable, examples may include social security, driver&apos;s license, state identification, or passport number; account log-in or financial account in combination with credentials; precise geolocation; racial or ethnic origin, religious beliefs, union membership, or citizenship and immigration status; genetic or biometric data; and personal information concerning health, sex life, or sexual orientation.
                  </p>
                  <p className="text-sm font-semibold text-slate-900">Collected: NO</p>
                </div>
              </div>
              
              <p className="text-slate-700 mb-4">
                We may also collect other personal information outside of these categories through instances where you interact with us in person, online, or by phone or mail in the context of:
              </p>
              
              <ul className="list-disc list-inside text-slate-700 ml-4 mb-4">
                <li>Receiving help through our customer support channels;</li>
                <li>Participation in customer surveys or contests; and</li>
                <li>Facilitation in the delivery of our Services and to respond to your inquiries.</li>
              </ul>
              
              <p className="text-slate-700 mb-6">
                We will use and retain the collected personal information as needed to provide the Services or for:
              </p>
              
              <ul className="list-disc list-inside text-slate-700 ml-4 mb-6">
                <li>Category B – 6 months</li>
                <li>Category H – 1 year</li>
              </ul>
              
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Sources of Personal Information</h3>
              <p className="text-slate-700 mb-6">
                Learn more about the sources of personal information we collect in "WHAT INFORMATION DO WE COLLECT?"
              </p>
              
              <h3 className="text-xl font-semibold text-slate-900 mb-3">How We Use and Share Personal Information</h3>
              <p className="text-slate-700 mb-4">
                Learn more about how we use your personal information in the section, "HOW DO WE PROCESS YOUR INFORMATION?"
              </p>
              
              <p className="text-slate-700 mb-4">
                <strong>Will your information be shared with anyone else?</strong>
              </p>
              
              <p className="text-slate-700 mb-4">
                We may disclose your personal information with our service providers pursuant to a written contract between us and each service provider. Learn more about how we disclose personal information to in the section, "WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?"
              </p>
              
              <p className="text-slate-700 mb-4">
                We may use your personal information for our own business purposes, such as for undertaking internal research for technological development and demonstration. This is not considered to be "selling" of your personal information.
              </p>
              
              <p className="text-slate-700 mb-6">
                We have not disclosed, sold, or shared any personal information to third parties for a business or commercial purpose in the preceding twelve (12) months. We will not sell or share personal information in the future belonging to website visitors, users, and other consumers.
              </p>
              
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Your Rights</h3>
              <p className="text-slate-700 mb-4">
                You have rights under certain US state data protection laws. However, these rights are not absolute, and in certain cases, we may decline your request as permitted by law. These rights include:
              </p>
              
              <ul className="list-disc list-inside text-slate-700 ml-4 mb-4">
                <li>Right to know whether or not we are processing your personal data</li>
                <li>Right to access your personal data</li>
                <li>Right to correct inaccuracies in your personal data</li>
                <li>Right to request the deletion of your personal data</li>
                <li>Right to obtain a copy of the personal data you previously shared with us</li>
                <li>Right to non-discrimination for exercising your rights</li>
                <li>Right to opt out of the processing of your personal data if it is used for targeted advertising (or sharing as defined under California's privacy law), the sale of personal data, or profiling in furtherance of decisions that produce legal or similarly significant effects ("profiling")</li>
              </ul>
              
              <p className="text-slate-700 mb-4">
                Depending upon the state where you live, you may also have the following rights:
              </p>
              
              <ul className="list-disc list-inside text-slate-700 ml-4 mb-6">
                <li>Right to access the categories of personal data being processed (as permitted by applicable law, including Minnesota's privacy law)</li>
                <li>Right to obtain a list of the categories of third parties to which we have disclosed personal data (as permitted by applicable law, including California's and Delaware's privacy law)</li>
                <li>Right to obtain a list of specific third parties to which we have disclosed personal data (as permitted by applicable law, including Minnesota's and Oregon's privacy law)</li>
                <li>Right to review, understand, question, and correct how personal data has been profiled (as permitted by applicable law, including Minnesota's privacy law)</li>
                <li>Right to limit use and disclosure of sensitive personal data (as permitted by applicable law, including California's privacy law)</li>
                <li>Right to opt out of the collection of sensitive data and personal data collected through the operation of a voice or facial recognition feature (as permitted by applicable law, including Florida's privacy law)</li>
              </ul>
              
              <h3 className="text-xl font-semibold text-slate-900 mb-3">How to Exercise Your Rights</h3>
              <p className="text-slate-700 mb-4">
                To exercise these rights, you can contact us by visiting __________, by emailing us at <a href="mailto:contact@epineon.ai" className="text-[#3689e5] hover:underline">contact@epineon.ai</a>, or by referring to the contact details at the bottom of this document.
              </p>
              
              <p className="text-slate-700 mb-6">
                Under certain US state data protection laws, you can designate an authorized agent to make a request on your behalf. We may deny a request from an authorized agent that does not submit proof that they have been validly authorized to act on your behalf in accordance with applicable laws.
              </p>
              
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Request Verification</h3>
              <p className="text-slate-700 mb-4">
                Upon receiving your request, we will need to verify your identity to determine you are the same person about whom we have the information in our system. We will only use personal information provided in your request to verify your identity or authority to make the request. However, if we cannot verify your identity from the information already maintained by us, we may request that you provide additional information for the purposes of verifying your identity and for security or fraud-prevention purposes.
              </p>
              
              <p className="text-slate-700 mb-6">
                If you submit the request through an authorized agent, we may need to collect additional information to verify your identity before processing your request and the agent will need to provide a written and signed permission from you to submit such request on your behalf.
              </p>
              
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Appeals</h3>
              <p className="text-slate-700 mb-6">
                Under certain US state data protection laws, if we decline to take action regarding your request, you may appeal our decision by emailing us at <a href="mailto:privacy@epineon.ai" className="text-[#3689e5] hover:underline">privacy@epineon.ai</a>. We will inform you in writing of any action taken or not taken in response to the appeal, including a written explanation of the reasons for the decisions. If your appeal is denied, you may submit a complaint to your state attorney general.
              </p>
              
              <h3 className="text-xl font-semibold text-slate-900 mb-3">California "Shine The Light" Law</h3>
              <p className="text-slate-700">
                California Civil Code Section 1798.83, also known as the "Shine The Light" law, permits our users who are California residents to request and obtain from us, once a year and free of charge, information about categories of personal information (if any) we disclosed to third parties for direct marketing purposes and the names and addresses of all third parties with which we shared personal information in the immediately preceding calendar year. If you are a California resident and would like to make such a request, please submit your request in writing to us by using the contact details provided in the section "HOW CAN YOU CONTACT US ABOUT THIS NOTICE?"
              </p>
            </section>

            {/* Section 12 */}
            <section id="section-12" className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">12. DO WE MAKE UPDATES TO THIS NOTICE?</h2>
              
              <p className="text-slate-700 mb-4">
                <strong>In Short:</strong> Yes, we will update this notice as necessary to stay compliant with relevant laws.
              </p>
              
              <p className="text-slate-700">
                We may update this Privacy Notice from time to time. The updated version will be indicated by an updated "Revised" date at the top of this Privacy Notice. If we make material changes to this Privacy Notice, we may notify you either by prominently posting a notice of such changes or by directly sending you a notification.
              </p>
            </section>

            {/* Section 13 */}
            <section id="section-13" className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">13. HOW CAN YOU CONTACT US ABOUT THIS NOTICE?</h2>
              
              <p className="text-slate-700 mb-4">
                If you have questions or comments about this notice, you may email us at <a href="mailto:y.bouamri@epinen.ai" className="text-[#3689e5] hover:underline">y.bouamri@epinen.ai</a> or contact us by post at:
              </p>
              
              <div className="mb-4 grid gap-4 md:grid-cols-2">
                <div className="legal-doc-card-panel p-4 lg:p-5">
                  <p className="font-semibold text-slate-900">EPINEON</p>
                  <p className="mt-1 text-slate-700">IMM ESPACE JET BUSINESS CLASS</p>
                </div>
                <div className="legal-doc-card-panel p-4 lg:p-5">
                  <p className="text-slate-700">LOT ATTAOUFIK 16 18 SIDI MAAROUF</p>
                  <p className="mt-1 text-slate-700">Casablanca 20520</p>
                  <p className="mt-1 text-slate-700">Morocco</p>
                </div>
              </div>
            </section>

            {/* Section 14 */}
            <section id="section-14" className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">14. HOW CAN YOU REVIEW, UPDATE, OR DELETE THE DATA WE COLLECT FROM YOU?</h2>
              
              <p className="text-slate-700">
                Based on the applicable laws of your country or state of residence in the US, you may have the right to request access to the personal information we collect from you, details about how we have processed it, correct inaccuracies, or delete your personal information. You may also have the right to withdraw your consent to our processing of your personal information. These rights may be limited in some circumstances by applicable law. To request to review, update, or delete your personal information, please contact us at <a href="mailto:privacy@epineon.ai" className="text-[#3689e5] hover:underline">privacy@epineon.ai</a>.
              </p>
            </section>

    </LegalDocLayout>
  )
}

export default PrivacyPolicy
