import { useState } from "react";
import { json, redirect } from "@remix-run/node";
import {
  useActionData,
  useLoaderData,
  useNavigation,
  useSubmit,
  useNavigate,
} from "@remix-run/react";
import {
  Card,
  Layout,
  Page,
  Text,
  TextField,
  BlockStack,
  PageActions,
} from "@shopify/polaris";
import db from "../db.server"; // Ensure the correct path
import { getMessage, validateMessage } from "../models/message.server"; // Ensure the correct path

// Loader function to fetch a message based on the ID, or return an empty object for new messages
export async function loader({ request, params }) {
  if (params.id === "new") {
    return json({ messageText: "" }); 
  }
  return json(await getMessage(Number(params.id)));
}

// Action function to handle form submission: create, update, or delete a message
export async function action({ request, params }) {
  const data = Object.fromEntries(await request.formData());

  if (data.action === "delete") {
    await db.message.delete({ where: { id: Number(params.id) } });
    return redirect("/app/messages");
  }

  const errors = validateMessage(data);

  if (errors) {
    return json({ errors }, { status: 422 });
  }

  const message =
    params.id === "new"
      ? await db.message.create({ data })
      : await db.message.update({ where: { id: Number(params.id) }, data });

  return redirect(`/app/messages/${message.id}`);
}

export default function MessageForm() {
  const errors = useActionData()?.errors || {};
  const message = useLoaderData();
  const [formState, setFormState] = useState(message);
  const [cleanFormState, setCleanFormState] = useState(message);
  const isDirty = JSON.stringify(formState) !== JSON.stringify(cleanFormState);

  const nav = useNavigation();
  const isSaving = nav.state === "submitting" && nav.formData?.get("action") !== "delete";
  const isDeleting = nav.state === "submitting" && nav.formData?.get("action") === "delete";

  const navigate = useNavigate();
  const submit = useSubmit();

  function handleSave() {
    const data = { messageText: formState.messageText };
    setCleanFormState({ ...formState });
    submit(data, { method: "post" });
  }

  return (
    <Page>
      <Page.TitleBar title={message.id ? "Edit Message" : "Create New Message"}>
        <button onClick={() => navigate("/app/messages")}>Messages</button>
      </Page.TitleBar>
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            <Card>
              <BlockStack gap="500">
                <Text as="h2" variant="headingLg">
                  Message
                </Text>
                <TextField
                  id="messageText"
                  helpText="This message will be visible to the users."
                  label="Message"
                  labelHidden
                  autoComplete="off"
                  value={formState.messageText}
                  onChange={(messageText) => setFormState({ ...formState, messageText })}
                  error={errors.messageText}
                />
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>

        <Layout.Section>
          <PageActions
            secondaryActions={[
              {
                content: "Delete",
                loading: isDeleting,
                disabled: !message.id || isSaving || isDeleting,
                destructive: true,
                outline: true,
                onAction: () => submit({ action: "delete" }, { method: "post" }),
              },
            ]}
            primaryAction={{
              content: "Save",
              loading: isSaving,
              disabled: !isDirty || isSaving || isDeleting,
              onAction: handleSave,
            }}
          />
        </Layout.Section>
      </Layout>
    </Page>
  );
}
