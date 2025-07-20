import { Heading, Container, Box, Text } from "@radix-ui/themes";
import "@/app/ui/globals.css";

export default function Home() {
  return (
    <div>
      < Container size="1">
        <Box py="9" px="2">
          <Heading>About</Heading>
          <Box pt="4" pb="4">
            <Text style={{color:"var(--green-12)"}}>
              <b>Hi! I am Mari, the creator of Sprigate.</b> <br />
              Sprigate is a solo project born out of countless hours spent manually transferring 
              Canvas assignments into my Notion databases every semester. 
              What started as a personal solution has grown into a tool for students everywhere.
              <br />
              An early version of this integration was featured in the <em>2024 Notion x Figma x The Browser Company: Tools for the Future</em> showcase. 
              Since then, I have focused on making Sprigate (formerly known as the Canvas Notion Integration) more accessible for all students.
              I am always exploring new features and improvements, so if you have ideas or feedback, feel free to reach out via the contact tab!
            </Text>
          </Box>
          <Heading size="5">Expanding beyond Canvas</Heading>
          <Box pt="4">
            <Text style={{color:"var(--green-12)"}}>
              While Sprigate is currently built around <em>Canvas</em>, I understand that not every university or high school uses it.
              In the future, I plan to expand beyond Canvas to make Sprigate a helpful tool for all students regardless what platform they use.
            </Text>
          </Box>
        </Box>
      </Container>
    </div>
  );
}