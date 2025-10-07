import { Heading, Container, Box, Flex, Text, Button, Inset, Link } from "@radix-ui/themes";
import "./ui/globals.css";
import Image from "next/image";
import Icon from "@/app/public/canvasnotioncover.svg"
import NotionExample from "@/app/public/notionexample.svg"

export default function Home() {
  return (
    <div>
      < Container size="3" pt="9" pb="9" flexGrow={"1"}>
        <Flex direction={"row"} gap="4" align={"center"}>
          <Flex direction={"column"} gap="8">
            <Box>
              <Heading size="8"><em>Sprigate:</em> The Canvas to Notion Integration.</Heading>
              <Box pt="2">
                <Text style={{color:"var(--green-11)"}}>Never worry about missing your assignment ever again.</Text>
              </Box>
            </Box>
            <Flex direction={"row"} gap="3">
              <Link href="/signup" underline="none">
                <Button size="3">Get Started</Button>
              </Link>
              <Link href="/learnmore">
                <Button variant="soft" size="3">Learn More</Button>
              </Link>
            </Flex>
          </Flex>
          <Box>
             <Image
                src={Icon}
                alt="Sprigate Logo"
                width={500}
              />
          </Box>
        </Flex>
      </Container>
      <Container size="3" pt="9" pb="9">
        <Flex direction={"row"} gap="8" justify={"center"}>
          <Box className="rounded-md" maxWidth={"400px"}
            style={{outline: "var(--green-a6) solid 4px", outlineOffset: "-1px", opacity: "100", backgroundColor:"var(--green-2)"}}
          >
            <Box pt="4" px="4">
              <Heading>See All Your Assignments Within One Database</Heading>
            </Box>
            <Box pt="2" px="4" pb="6">
              <Text style={{color:"var(--green-12)"}}>Sprigate organizes your quizzes, assignments, and discussions with a click of a button.</Text>
            </Box>
            <Inset clip="padding-box" side="bottom">
              <Image 
                alt="Notion Example"
                src={NotionExample}
              />
            </Inset>
          </Box>
          <Box className="rounded-md" maxWidth={"400px"}
            style={{outline: "var(--green-a6) solid 4px", outlineOffset: "-1px", opacity: "100", backgroundColor:"var(--green-2)"}}
          >
            <Box pt="4" px="4">
              <Heading>Reoccurring Queries to Keep All Assignments Up to Date</Heading>
            </Box>
            <Box py="2" px="4">
              <Text style={{color:"var(--green-12)"}}>Assignments change and are added over the semester. With Sprigate, you can set up a time period to refresh the queries.</Text>
            </Box>
          </Box>
        </Flex>
      </Container>
    </div>
  );
}
