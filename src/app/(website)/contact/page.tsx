import { Heading, Container, Box} from "@radix-ui/themes";
import "@/app/ui/globals.css";
import ContactForm from "@/app/ui/contactme";

export default function Home() {
  return (
    <div>
      < Container size="1" py="9" px="2" minHeight={"35em"}>
        <Box className="rounded-md" p="6" pb="8"
          style={{outline: "var(--green-a6) solid 4px", outlineOffset: "-1px", opacity: "100", backgroundColor:"var(--green-2)"}}
        >
          <Heading>Contact</Heading>
          <Box pt="2">
            <Heading size="2" style={{color:"var(--green-11)"}}>
              Please reach out if you have any questions, comments, or concerns! <br/>
              I will try to respond as soon as I can :)
            </Heading>
          </Box>
          <ContactForm />
        </Box>
      </Container>
    </div>
  );
}