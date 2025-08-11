import { Container, Heading, Text, Button, Flex, Box } from "@radix-ui/themes";
import Link from 'next/link'
 
export default function NotFound() {
  return (
    <Container size="1" py="9" px="2" minHeight={"35em"}>
      <Flex direction={"column"} p="4">
        <Heading>Not found!</Heading>
        <Box pt="2">
          <Text>Could not find requested resource.</Text>
        </Box>
        <Box pt="4">
          <Link href="/">
            <Button>Return Home</Button>
          </Link>
        </Box>
      </Flex>
    </Container>
  )
}