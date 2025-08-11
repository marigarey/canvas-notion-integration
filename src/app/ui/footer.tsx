import { Box, Section, Flex, Link, Text } from "@radix-ui/themes"
import Image from "next/image";
import LogoText from "@/app/public/sprigatefull.svg"

export default function Footer() {
  return (
    <Box style={{ backgroundColor: "var(--green-2)"}} position={"static"} bottom={"0"}>
      <Section py="9" px="2">
        <Flex direction={"row"} justify={"between"}>
          <Box position={"relative"} left="2">
            <Link href="/">
              <Image 
                src={LogoText}
                alt="Sprigate Logo with Text"
                width={110}
                height={40}
              />
            </Link>
          </Box>
          <Flex gap="4" justify={"between"}>
            <Link href="/privacy" target="_blank">Privacy Policy</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/terms" target="_blank">Terms of Service</Link>
          </Flex>
          <Box position={"relative"} right="4">
            <Text>©2025 Sprigate</Text>
          </Box>
        </Flex>
      </Section>
    </Box>
  );
}