import React from 'react'
import { LegalDocLayout } from '../components/LegalDocLayout'

const COOKIE_TOC = [
  { id: 'section-intro', label: 'Introduction' },
  { id: 'section-what-are-cookies', label: 'What are cookies?' },
  { id: 'section-why-cookies', label: 'Why we use cookies' },
  { id: 'section-how-control-cookies', label: 'How can I control cookies?' },
  { id: 'section-browser-cookies', label: 'Cookies on your browser' },
  { id: 'section-other-tracking', label: 'Other tracking technologies' },
  { id: 'section-flash-cookies', label: 'Flash cookies & Local Shared Objects' },
  { id: 'section-targeted-advertising', label: 'Targeted advertising' },
  { id: 'section-policy-updates', label: 'Updates to this policy' },
  { id: 'section-further-information', label: 'Further information' },
]

const CookiePolicy = () => {
  return (
    <LegalDocLayout
      title="Cookie Policy"
      path="/cookie-policy"
      lastUpdated="February 10, 2025"
      effectiveDate="February 10, 2025"
      tocItems={COOKIE_TOC}
    >
            {/* Introduction */}
            <div id="section-intro" className="mb-8">
              <p className="text-slate-700 leading-relaxed mb-4">
                This Cookie Policy explains how EPINEON ("the Company," "we," "our," or "us") uses cookies and similar technologies to recognize you when you visit our website at <a href="https://epineon.ai" className="text-[#3689e5] hover:underline">https://epineon.ai</a> ("Website"). It details what these technologies are, why we use them, and your rights regarding their use.
              </p>
              <p className="text-slate-700 leading-relaxed">
                In some cases, we may use cookies to collect personal data or data that, when combined with other information, becomes personal information.
              </p>
            </div>

            {/* What are cookies? */}
            <section id="section-what-are-cookies" className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">What are cookies?</h2>

              <p className="text-slate-700 mb-4">
                Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners in order to make their websites work, or to work more efficiently, as well as to provide reporting information.
              </p>

              <p className="text-slate-700">
                Cookies set by the website owner (in this case, EPINEON) are called "first-party cookies." Cookies set by parties other than the website owner are called "third-party cookies." Third-party cookies enable third-party features or functionality to be provided on or through the website (e.g., advertising, interactive content, and analytics). The parties that set these third-party cookies can recognize your computer both when it visits the website in question and also when it visits certain other websites.
              </p>
            </section>

            {/* Why do we use cookies? */}
            <section id="section-why-cookies" className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Why do we use cookies?</h2>

              <p className="text-slate-700">
                We use first- and third-party cookies for several reasons. Some cookies are required for technical reasons in order for our Website to operate, and we refer to these as "essential" or "strictly necessary" cookies. Other cookies also enable us to track and target the interests of our users to enhance the experience on our Online Properties. Third parties serve cookies through our Website for advertising, analytics, and other purposes. This is described in more detail below.
              </p>
            </section>

            {/* How can I control cookies? */}
            <section id="section-how-control-cookies" className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">How can I control cookies?</h2>

              <p className="text-slate-700 mb-4">
                You have the right to decide whether to accept or reject cookies. You can exercise your cookie rights by setting your preferences in the Cookie Consent Manager. The Cookie Consent Manager allows you to select which categories of cookies you accept or reject. Essential cookies cannot be rejected as they are strictly necessary to provide you with services.
              </p>

              <p className="text-slate-700 mb-4">
                The Cookie Consent Manager can be found in the notification banner and on our Website. If you choose to reject cookies, you may still use our Website though your access to some functionality and areas of our Website may be restricted. You may also set or amend your web browser controls to accept or refuse cookies.
              </p>

              <p className="text-slate-700 mb-6">
                The specific types of first- and third-party cookies served through our Website and the purposes they perform are described in the table below (please note that the specific cookies served may vary depending on the specific Online Properties you visit):
              </p>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Performance and functionality cookies:</h3>
                <p className="text-slate-700 mb-4">
                  These cookies are used to enhance the performance and functionality of our Website but are non-essential to their use. However, without these cookies, certain functionality (like videos) may become unavailable.
                </p>

                <div className="legal-doc-card-panel overflow-x-auto mb-6 p-4 lg:p-5">
                  <table className="w-full border-collapse border border-slate-300">
                    <tbody className="text-slate-700">
                      <tr>
                        <td className="border border-slate-300 p-3 font-semibold">Name:</td>
                        <td className="border border-slate-300 p-3">wpEmojiSettingsSupports</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-3 font-semibold">Purpose:</td>
                        <td className="border border-slate-300 p-3">This cookie is utilized to enable emoji support on pages using WordPress.</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-3 font-semibold">Provider:</td>
                        <td className="border border-slate-300 p-3">epineon.ai</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-3 font-semibold">Service:</td>
                        <td className="border border-slate-300 p-3">.voices.com</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-3 font-semibold">Type:</td>
                        <td className="border border-slate-300 p-3">html_session_storage</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-3 font-semibold">Expires in:</td>
                        <td className="border border-slate-300 p-3">session</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Unclassified cookies:</h3>
                <p className="text-slate-700 mb-4">
                  These are cookies that have not yet been categorized. We are in the process of classifying these cookies with the help of their providers.
                </p>

                <div className="legal-doc-card-panel overflow-x-auto mb-6 p-4 lg:p-5">
                  <table className="w-full border-collapse border border-slate-300">
                    <tbody className="text-slate-700">
                      <tr>
                        <td className="border border-slate-300 p-3 font-semibold">Name:</td>
                        <td className="border border-slate-300 p-3">elementor</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-3 font-semibold">Provider:</td>
                        <td className="border border-slate-300 p-3">epineon.ai</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-3 font-semibold">Type:</td>
                        <td className="border border-slate-300 p-3">html_local_storage</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-3 font-semibold">Expires in:</td>
                        <td className="border border-slate-300 p-3">persistent</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* How can I control cookies on my browser? */}
            <section id="section-browser-cookies" className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">How can I control cookies on my browser?</h2>

              <p className="text-slate-700 mb-4">
                As the means by which you can refuse cookies through your web browser controls vary from browser to browser, you should visit your browser's help menu for more information. The following is information about how to manage cookies on the most popular browsers:
              </p>

              <ul className="list-disc list-inside text-slate-700 ml-4 mb-6">
                <li><a href="https://support.google.com/chrome/answer/95647#zippy=%2Callow-or-block-cookies" className="text-[#3689e5] hover:underline">Chrome</a></li>
                <li><a href="https://support.microsoft.com/en-us/windows/delete-and-manage-cookies-168dab11-0753-043d-7c16-ede5947fc64d" className="text-[#3689e5] hover:underline">Internet Explorer</a></li>
                <li><a href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop?redirectslug=enable-and-disable-cookies-website-preferences&redirectlocale=en-US" className="text-[#3689e5] hover:underline">Firefox</a></li>
                <li><a href="https://support.apple.com/en-ie/guide/safari/sfri11471/mac" className="text-[#3689e5] hover:underline">Safari</a></li>
                <li><a href="https://support.microsoft.com/en-us/windows/microsoft-edge-browsing-data-and-privacy-bb8174ba-9d73-dcf2-9b4a-c582b4e640dd" className="text-[#3689e5] hover:underline">Edge</a></li>
                <li><a href="https://help.opera.com/en/latest/web-preferences/" className="text-[#3689e5] hover:underline">Opera</a></li>
              </ul>

              <p className="text-slate-700 mb-4">
                In addition, most advertising networks offer you a way to opt out of targeted advertising. If you would like to find out more information, please visit:
              </p>

              <ul className="list-disc list-inside text-slate-700 ml-4">
                <li><a href="http://www.aboutads.info/choices/" className="text-[#3689e5] hover:underline">Digital Advertising Alliance</a></li>
                <li><a href="https://youradchoices.ca/" className="text-[#3689e5] hover:underline">Digital Advertising Alliance of Canada</a></li>
                <li><a href="http://www.youronlinechoices.com/" className="text-[#3689e5] hover:underline">European Interactive Digital Advertising Alliance</a></li>
              </ul>
            </section>

            {/* What about other tracking technologies? */}
            <section id="section-other-tracking" className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">What about other tracking technologies, like web beacons?</h2>

              <p className="text-slate-700">
                Cookies are not the only way to recognize or track visitors to a website. We may use other, similar technologies from time to time, like web beacons (sometimes called "tracking pixels" or "clear gifs"). These are tiny graphics files that contain a unique identifier that enables us to recognize when someone has visited our Website or opened an email including them. This allows us, for example, to monitor the traffic patterns of users from one page within a website to another, to deliver or communicate with cookies, to understand whether you have come to the website from an online advertisement displayed on a third-party website, to improve site performance, and to measure the success of email marketing campaigns. In many instances, these technologies are reliant on cookies to function properly, and so declining cookies will impair their functioning.
              </p>
            </section>

            {/* Flash cookies */}
            <section id="section-flash-cookies" className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Do you use Flash cookies or Local Shared Objects?</h2>

              <p className="text-slate-700 mb-4">
                Websites may also use so-called "Flash Cookies" (also known as Local Shared Objects or "LSOs") to, among other things, collect and store information about your use of our services, fraud prevention, and for other site operations.
              </p>

              <p className="text-slate-700 mb-4">
                If you do not want Flash Cookies stored on your computer, you can adjust the settings of your Flash player to block Flash Cookies storage using the tools contained in the <a href="http://www.macromedia.com/support/documentation/en/flashplayer/help/settings_manager07.html" className="text-[#3689e5] hover:underline">Website Storage Settings Panel</a>. You can also control Flash Cookies by going to the <a href="http://www.macromedia.com/support/documentation/en/flashplayer/help/settings_manager03.html" className="text-[#3689e5] hover:underline">Global Storage Settings Panel</a> and following the instructions (which may include instructions that explain, for example, how to delete existing Flash Cookies (referred to "information" on the Macromedia site), how to prevent Flash LSOs from being placed on your computer without your being asked, and (for Flash Player 8 and later) how to block Flash Cookies that are not being delivered by the operator of the page you are on at the time).
              </p>

              <p className="text-slate-700">
                Please note that setting the Flash Player to restrict or limit acceptance of Flash Cookies may reduce or impede the functionality of some Flash applications, including, potentially, Flash applications used in connection with our services or online content.
              </p>
            </section>

            {/* Targeted advertising */}
            <section id="section-targeted-advertising" className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Do you serve targeted advertising?</h2>

              <p className="text-slate-700">
                Third parties may serve cookies on your computer or mobile device to serve advertising through our Website. These companies may use information about your visits to this and other websites in order to provide relevant advertisements about goods and services that you may be interested in. They may also employ technology that is used to measure the effectiveness of advertisements. They can accomplish this by using cookies or web beacons to collect information about your visits to this and other sites in order to provide relevant advertisements about goods and services of potential interest to you. The information collected through this process does not enable us or them to identify your name, contact details, or other details that directly identify you unless you choose to provide these.
              </p>
            </section>

            {/* Updates */}
            <section id="section-policy-updates" className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">How often will you update this Cookie Policy?</h2>

              <p className="text-slate-700 mb-4">
                We may update this Cookie Policy from time to time in order to reflect, for example, changes to the cookies we use or for other operational, legal, or regulatory reasons. Please therefore revisit this Cookie Policy regularly to stay informed about our use of cookies and related technologies.
              </p>

              <p className="text-slate-700">
                The date at the top of this Cookie Policy indicates when it was last updated.
              </p>
            </section>

            {/* Contact information */}
            <section id="section-further-information" className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Where can I get further information?</h2>

              <p className="text-slate-700 mb-4">
                If you have any questions about our use of cookies or other technologies, please email us at <a href="mailto:contact@epineon.ai" className="text-[#3689e5] hover:underline">contact@epineon.ai</a> or by post to:
              </p>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="legal-doc-card-panel p-4 lg:p-5">
                  <p className="font-semibold text-slate-900">EPINEON</p>
                  <p className="mt-1 text-slate-700">IMM ESPACE JET BUSINESS CLASS</p>
                </div>
                <div className="legal-doc-card-panel p-4 lg:p-5">
                  <p className="text-slate-700">LOT ATTAOUFIK 16 18 SIDI MAAROUF</p>
                  <p className="mt-1 text-slate-700">Casablanca, 20520</p>
                  <p className="mt-1 text-slate-700">Morocco</p>
                </div>
              </div>
            </section>

    </LegalDocLayout>
  )
}

export default CookiePolicy
