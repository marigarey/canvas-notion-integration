import { Heading, Container, Box, Link, Text } from "@radix-ui/themes";
import "@/app/ui/globals.css";

export default function Home() {
  return (
    <div>
      < Container size="1">
        <Box pt="9" pb="4">
          <Heading>Learn More</Heading>
          <Box pt="2">
            <Heading size="2" style={{color:"var(--green-11)"}}>To give more transparency into the process.</Heading>
          </Box>
        </Box>
        <Box pb="4">
          <Heading size="5" style={{color:"var(--green-12)"}}>How does Sprigate Work?</Heading>
          <Box pt="4">
            <Text>
            Spriagate integrates the <Link href="https://developerdocs.instructure.com/services/canvas" target="_blank">Canvas API </Link> 
            to query all your currently active courses, and obtain all the assignments, discussions, and quizzes associated with those classes.
            From there, the <Link href="https://developers.notion.com/" target="_blank">Notion API</Link> is used to create or update your Notion database
            and add all the information from Canvas into the database. All the information I use is free and open to the public. I encourage anyone
            interested in learning more about how to make their own Canvas or Notion integrations use their documentation to learn more!
            </Text>
          </Box>
        </Box>
        <Box pb="4">
          <Heading size="5" style={{color:"var(--green-12)"}}>How should I use Sprigate?</Heading>
          <Box pt="4">
            <Text>
              Currently, Sprigate supports automatic monthly updates and once a day manual updates. If you get a notification that a course has changed its due date 
              I would manually run Sprigate to make sure all the information is still up to date. The first state of the database will not be sorted or filtered 
              because Notion is a very user specific software. So, I left the sorting and filtering up to you! <br/>
              I reccomend you set your sorting to ascending and filter on assignments that are due within the week (This is how I use my Sprigate database).
            </Text>
          </Box>
        </Box>
      </Container>
    </div>
  );
}