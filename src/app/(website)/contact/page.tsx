import { Heading, Container, Box } from "@radix-ui/themes";
import "@/app/ui/globals.css";

export default function Home() {
  return (
    <div>
      < Container size="1">
        <Box py="9" px="2"><Heading>Contact</Heading></Box>
      </Container>
    </div>
  );
}