import { Heading, Box, Text, Link, Container } from "@radix-ui/themes";
import "@/app/ui/globals.css";

export default function Home() {
  return (
    <div>
      <Container>
        <Box py="3" px="5">
          <Heading>Sprigate Terms of Service</Heading>
          <Text>
            Effective Date: July 19, 2025 <br />
            Last Updated: July 19, 2025 <br />
            These Terms of Service (“Terms”) constitute a binding legal agreement between you (“User”, “you”) and Sprigate (“Sprigate”, “we”, “our”, or “us”), governing your access to and use of the website located at https://sprigate.com (the “Site”) and any products, services, applications, or tools provided through or in connection with Sprigate (collectively, the “Services”).
            By accessing or using the Services, you acknowledge that you have read, understood, and agree to be bound by these Terms. If you do not agree, you may not access or use the Services. <br />
          </Text>
          <Heading size="5">1. Eligibility and Account Registration</Heading>
          <Text>
            1.1 Eligibility. You must be at least thirteen (13) years of age or the age of digital consent in your jurisdiction to create an account and use the Services. By registering, you represent and warrant that you meet this requirement. <br />
            1.2 Account Registration. Access to certain features of the Services requires registration and creation of a user account. You agree to: <br />
              &emsp;Provide accurate, current, and complete information <br />
              &emsp;Maintain and promptly update such information <br />
              &emsp;Maintain the security of your account credentials <br />
              &emsp;Accept responsibility for all activities that occur under your account <br />
            Sprigate reserves the right to suspend or terminate your account if it determines that you have violated these Terms. <br />
          </Text>
          <Heading size="5">2. Use of the Services</Heading>
          <Text>
            2.1 License. Subject to your compliance with these Terms, Sprigate grants you a limited, non-exclusive, non-transferable, non-sublicensable license to access and use the Services for your personal, non-commercial use. <br />
            2.2 Prohibited Conduct. You agree not to: <br />
              &emsp;Use the Services for any unlawful, infringing, or fraudulent purpose <br />
              &emsp;Interfere with or disrupt the integrity or performance of the Services <br />
              &emsp;Attempt to gain unauthorized access to any part of the Services, user accounts, or systems <br />
              &emsp;Copy, modify, distribute, sell, or lease any part of the Services or create derivative works without our express written permission <br />
            Sprigate reserves the right to investigate and take appropriate legal action against violations of this section.
          </Text>
          <Heading size="5">3. User Content and Feedback</Heading>
          <Text>
            3.1 Feedback. If you submit any ideas, suggestions, feedback, or proposals regarding the Services (collectively, “Feedback”), you agree that: <br />
              &emsp;Sprigate may use such Feedback without restriction or obligation to you <br />
              &emsp;Sprigate shall own all rights, title, and interest in and to such Feedback <br />
              &emsp;You waive any moral rights or rights of attribution you may have in such Feedback <br />
              &emsp;No compensation, acknowledgment, or attribution is required for any use of Feedback <br />
            You represent and warrant that any Feedback you submit does not infringe or violate any third-party rights.
          </Text>
          <Heading size="5">4. Intellectual Property</Heading>
          <Text>
            4.1 Ownership. All content, trademarks, service marks, software, and other materials available through the Services (excluding User Content) are the property of Sprigate or its licensors, and are protected by copyright, trademark, and other applicable intellectual property laws.<br />
            4.2 Restrictions. Except as expressly authorized in writing, you may not:<br />
              &emsp;Copy, reproduce, distribute, display, or modify any content from the Services <br />
              &emsp;Use any Sprigate name, logo, or trademark without our prior written consent
          </Text>
          <Heading size="5">5. Privacy</Heading>
          <Text>
            Sprigate’s collection and use of your personal information is governed by our <a href="https://www.freeprivacypolicy.com/live/da112242-cbc1-4fd2-b177-94cc3fef37b4" target="_blank">Privacy Policy</a>, which is incorporated by reference into these Terms. 
            By using the Services, you consent to the practices described therein. <br />
          </Text>
          <Heading size="5">6. Termination</Heading>
          <Text>
            6.1 Termination by You. You may terminate your account at any time by contacting us or following any available account deletion instructions. <br />
            6.2 Termination by Sprigate. We reserve the right to suspend or terminate your access to the Services at our sole discretion, with or without notice, including for violation of these Terms. <br />
            6.3 Effect of Termination. Upon termination, your right to access and use the Services will immediately cease. The provisions of these Terms that by their nature should survive termination shall survive, including Sections 3, 4, 6, 7, 8, and 9.
          </Text>
          <Heading size="5">7. Disclaimer of Warranties</Heading>
          <Text>
            The Services are provided on an “AS IS” and “AS AVAILABLE” basis, without warranties of any kind, express or implied, including but not limited to: <br />
              &emsp;Merchantability <br />
              &emsp;Fitness for a particular purpose<br />
              &emsp;Non-infringement <br />
              &emsp;Availability, accuracy, or error-free operation <br />
            Sprigate does not warrant that the Services will be uninterrupted, secure, or free of viruses or other harmful components.
          </Text>
          <Heading size="5">8. Limitation of Liability</Heading>
          <Text>
            To the fullest extent permitted by law, Sprigate and its affiliates, officers, employees, agents, and licensors shall not be liable for any:<br />
              &emsp;Indirect, incidental, special, consequential, or punitive damages <br />
              &emsp;Loss of profits, data, or goodwill <br />
              &emsp;Damages resulting from your use of or inability to use the Services<br />
            Sprigate&apos;s total liability to you for any claim related to the Services shall not exceed $100 or the amount you paid us (if any) in the twelve (12) months preceding the claim, whichever is greater.
          </Text>
          <Heading size="5">9. Modifications</Heading>
          <Text>
            We may revise these Terms from time to time in our sole discretion. 
            We will provide notice of any material changes by posting the updated Terms to the Site. 
            Your continued use of the Services after the effective date of any changes constitutes your acceptance of the revised Terms.
          </Text>
          <Heading size="5">10. Governing Law and Dispute Resolution</Heading>
          <Text>
            These Terms and any dispute arising out of or relating to them shall be governed by the laws of the State of Wisconsin, without regard to conflict of law principles. <br />
            You agree to resolve any dispute through binding arbitration or small claims court, unless prohibited by law. The arbitration shall be conducted in Madison, WI.
          </Text>
          <Heading size="5">11. Contact Information</Heading>
          <Text>
            If you have any questions, concerns, or requests regarding these Terms or the Services, please contact us at:
            <Link href="/contact">sprigate.com/contact</Link>
          </Text>
        </Box>
      </Container>
    </div>
  );
}