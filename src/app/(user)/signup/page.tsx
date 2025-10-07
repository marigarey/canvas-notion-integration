'use server'
import { Heading, Container, Box, Flex } from "@radix-ui/themes";
import SignupForm from "@/app/ui/signup";

export default async function signup() {
  return (
    <Container size="1" py="9" px="2" minHeight={"35em"}>
        <Box className="rounded-md" p="6"
            style={{outline: "var(--green-a6) solid 4px", outlineOffset: "-1px", opacity: "100", backgroundColor:"var(--green-2)"}}
          >
            <Heading>Sign Up</Heading>
            <Box pt="2">
              <Heading size="2" style={{color:"var(--green-11)"}}>
                
              </Heading>
            </Box>
          <SignupForm/>
        </Box>
    </Container>
  )
}