import { json } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  Button,
  Link,
  IndexTable,
  EmptyState,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { getMessages } from "../models/message.server";

export async function loader({ request }) {
  const { admin, session } = await authenticate.admin(request);
  const messages = await getMessages(); // To fetch data from backend and load it

  return json({ messages });
}

const EmptyMessageState = ({ onAction }) => (
  <EmptyState
    heading="No messages available"
    action={{ content: "Create Message", onAction }}
    image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
  >
    <p>You can create new messages here.</p>
  </EmptyState>
);

function truncate(str, { length = 25 } = {}) {
  if (!str) return "";
  if (str.length <= length) return str;
  return str.slice(0, length) + "…";
}

const MessageTable = ({ messages }) => (
  <IndexTable
    resourceName={{ singular: "Message", plural: "Messages" }}
    itemCount={messages.length}
    headings={[
      { title: "Title" },
      { title: "Date Created" },
      { title: "Actions" },
    ]}
    selectable={false}
  >
    {messages.map((message) => (
      <MessageTableRow key={message.id} message={message} />
    ))}
  </IndexTable>
);

const MessageTableRow = ({ message }) => (
  <IndexTable.Row id={message.id} position={message.id}>
    <IndexTable.Cell>
      <Link to={`/app/messages/${message.id}`}>{truncate(message.messageText)}</Link>
    </IndexTable.Cell>
    <IndexTable.Cell>{new Date(message.createdAt).toDateString()}</IndexTable.Cell>
    <IndexTable.Cell>
      <Button
        destructive
        onClick={() => {
          if (confirm("Are you sure you want to delete this message?")) {
            fetch(`/messages/${message.id}`, { method: "DELETE" })
              .then(() => window.location.reload());
          }
        }}
      >
        Delete
      </Button>
    </IndexTable.Cell>
  </IndexTable.Row>
);

export default function Index() {
  const { messages } = useLoaderData();
  const navigate = useNavigate();

  return (
    <Page>
      <Page.TitleBar
        title="Messages"
        primaryAction={{
          content: "Create Message",
          onAction: () => navigate("/app/messages/new"),
        }}
      />
      <Layout>
        <Layout.Section>
          <Card padding="0">
            {messages.length === 0 ? (
              <EmptyMessageState onAction={() => navigate("/app/messages/new")} />
            ) : (
              <MessageTable messages={messages} />
            )}
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
