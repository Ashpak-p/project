import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { secureHeaders } from "hono/secure-headers";
import { cors } from "hono/cors";
import { compress } from "hono/compress";
import {
  createNote,
  Note,
  deleteNote,
  getAll,
  getNote,
  updateNote,
} from "./notes";
import {createNoteRequestSchema, getSingleNoteSchema, updateNoteRequestSchema } from "./schema";

const app = new Hono();

app.use("*", secureHeaders());

app.use("*", compress());

app.use(
  "*",
  cors({
    origin: ["https://seen.red"],
  }),
);

// TODO: Pagination

app.post("/", async (c) => {
  // CREATE
  let data: unknown;

  try {
    data = await c.req.json();
  } catch (error) {
    console.error(error);
    c.status(400);
    return c.json({
      success: false,
      message: "Invalid JSON in the request body",
    });
  }

  const validation = createNoteRequestSchema.safeParse(data);

  if (!validation.success) {
    c.status(400);
    return c.json({
      success: false,
      message: JSON.parse(validation.error.message)[0],
    });
  }

  const validatedData = validation.data;

  let success = true;
  let message = "Successfully added the note";
  let notes: Note[];

  try {
    notes = await getAll();
  } catch (error) {
    c.status(500);
    success = false;
    message = "Error retrieving notes";
    console.error("Error connecting to DB.", error);
    return c.json({ success, message });
  }

  if (notes.find((x) => x.text === validatedData.text)) {
    c.status(400);
    return c.json({ success: false, message: "already exists" });
  }


  const newNote: Partial<Note> = {
    text: validatedData.text,
    date: new Date(validatedData.date || Date.now()),
  };

  // const dbNote = await createNote(newNote);

  try {
    var dbNote = await createNote(newNote);
  } catch (error) {
    console.error(error);
    c.status(500);
    return c.json({ success: false, message: "Error in creating a note" });
  }

  console.log({ dbNote });

  notes.push(dbNote);

  return c.json({ message, note: dbNote });
});

app.get("/:id", async (c) => {
  // READ

  const result = getSingleNoteSchema.safeParse(c.req.param("id"));

  if (!result.success) {
    c.status(400);
    return c.json({
      success: false,
      message: JSON.parse(result.error.message)[0].message,
    });
  }

  const id = result.data;

  let note: Note | undefined;
  let success = true;
  let message = "A note found";

  try {
    note = await getNote(id);
  } catch (error) {
    c.status(500);
    success = false;
    message = "Error connecting to the database.";
    console.error("Error connecting to DB.", error);
    return c.json({ success, message });
  }

  if (!note) {
    c.status(404);
    return c.json({ success: false, message: "note not found" });
  }

  return c.json({ success, message, note });
});

app.put("/:id", async (c) => {
  // UPDATE
  const result = getSingleNoteSchema.safeParse(c.req.param("id"));

  let data: unknown;

  try {
    data = await c.req.json();
  } catch (error) {
    console.error(error);
    c.status(400);
    return c.json({
      success: false,
      message: "Invalid JSON in the request body",
    });
  }

  if (!result.success) {
    c.status(400);
    return c.json({
      success: false,
      message: JSON.parse(result.error.message)[0].message,
    });
  }

  const id = result.data;

  const validation = updateNoteRequestSchema.safeParse(data);

  if (!validation.success) {
    c.status(400);
    return c.json({
      success: false,
      message: JSON.parse(validation.error.message)[0],
    });
  }

  const validatedData = validation.data;

  let success = true;
  let message = "Successfully retrieved";
  let notes: Note[];

  try {
    notes = await getAll();
  } catch (error) {
    c.status(500);
    success = false;
    message = "Error retrieving notes";
    console.error("Error connecting to DB.", error);
    return c.json({ success, message });
  }

  const foundIndex = notes.findIndex((n) => n.id === id);

  if (foundIndex === -1) {
    c.status(404);
    return c.json({ success: false, message: "note not found" });
  }

  notes[foundIndex] = {
    id: notes[foundIndex].id,
    text: validatedData.text || notes[foundIndex].text,
    date: new Date(validatedData.date || notes[foundIndex].date.getTime()),
  };

  try {
    await updateNote(notes[foundIndex].id, notes[foundIndex]);
  } catch (error) {
    console.error(error);
    c.status(500);
    return c.json({ success: false, message: "Error in updating the note" });
  }

  return c.json({ success: true, message: "successfully updated" });
});

app.delete("/:id", async (c) => {
  // DELETE
  const result = getSingleNoteSchema.safeParse(c.req.param("id"));

  if (!result.success) {
    c.status(400);
    return c.json({
      success: false,
      message: JSON.parse(result.error.message)[0].message,
    });
  }

  const id = result.data;

  let success = true;
  let message = "Successfully deleted";
  let notes: Note[];

  try {
    notes = await getAll();
  } catch (error) {
    c.status(500);
    success = false;
    message = "Error retrieving notes";
    console.error("Error connecting to DB.", error);
    return c.json({ success, message });
  }

  const foundIndex = notes.findIndex((n) => n.id === id);



  if (foundIndex === -1) {
    c.status(404);
    return c.json({  success: false, message: "note not found" });
  }

  notes.splice(foundIndex, 1);

  deleteNote(id);

  return c.json({ success: true, message });
});

app.get("/", async (c) => {
  let success = true;
  let message = "Successfully retrieved";
  let notes: Note[];

  try {
    notes = await getAll();
  } catch (error) {
    c.status(500);
    success = false;
    message = "Error retrieving notes";
    console.error("Error connecting to DB.", error);
    notes = [];
  }

  return c.json({ success, message, notes });
}); // LIST

serve(app);