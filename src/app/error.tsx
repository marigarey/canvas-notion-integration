'use client'

import { Container, Heading, Text, Flex, Box } from "@radix-ui/themes";

export default function Error() {
  return (
    <Container size="1" py="9" px="2" minHeight={"35em"}>
      <Box className="rounded-md" p="6" pb="8"
          style={{outline: "var(--green-a6) solid 4px", outlineOffset: "-1px", opacity: "100", backgroundColor:"var(--green-2)"}}
      >
        <Flex direction={"column"} p="4">
          <Heading>Error!</Heading>
          <Box pt="2">
            <Text>Unidentified Error!</Text>
          </Box>
        </Flex>
      </Box>
    </Container>
  )
}