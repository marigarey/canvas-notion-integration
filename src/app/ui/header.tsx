import { Box, Section, Flex, Link, Button } from "@radix-ui/themes"
import Image from "next/image";
import Logo from "@/app/public/sprigate.svg"

export default function Header() {
  return (
    <Box style={{ backgroundColor: "var(--green-a2)"}} position={"sticky"}>
      <Section py="4" px="2">
        <Flex direction={"row"} gap="9" align={"center"}>
          <Box position={"relative"} left="2">
            <Link href="/">
              <Image 
                width={40}
                height={40}
                src={Logo}
                alt="Sprigate Logo"
              />
            </Link>
          </Box>
          <Box position={"relative"}>
            <Flex direction={"row"} gap="9" justify={"between"}>
              <Box>
                <Link href="/about">About</Link>
              </Box>
              <Box>
                <Link href="/learnmore">Learn More</Link>
              </Box>
              <Box>
                <Link href="/contact">Contact</Link>
              </Box>
            </Flex>
          </Box>
          <Flex gap="5" position={"absolute"} right="4">
            <Button variant="soft">
              Login
            </Button>
            <Button>
              Get Started
            </Button>
          </Flex>
        </Flex>
      </Section>
    </Box>
  );
}