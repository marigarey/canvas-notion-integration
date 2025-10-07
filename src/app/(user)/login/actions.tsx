'use server'
import { Heading, Container, Box} from "@radix-ui/themes";
//import { redirect } from 'next/navigation'

export default async function logUserIn() {
  return (
    <Container size="1" py="9" px="2" minHeight={"35em"}>
      <Box className="rounded-md" p="6"
          style={{outline: "var(--green-a6) solid 4px", outlineOffset: "-1px", opacity: "100", backgroundColor:"var(--green-2)"}}
        >
          <Heading>Login</Heading>
      </Box>

    </Container>
  )
}
