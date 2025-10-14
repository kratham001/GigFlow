import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  available: boolean;
}

const ManageBooks = () => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: books, isLoading } = useQuery({
    queryKey: ["books"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("books")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Book[];
    },
  });

  const addBookMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const { error } = await supabase.from("books").insert({
        title: formData.get("title") as string,
        author: formData.get("author") as string,
        genre: formData.get("genre") as string,
        available: true,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      toast({ title: "Book added successfully" });
      setIsAddOpen(false);
    },
    onError: () => {
      toast({ title: "Failed to add book", variant: "destructive" });
    },
  });

  const updateBookMutation = useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: FormData }) => {
      const { error } = await supabase
        .from("books")
        .update({
          title: formData.get("title") as string,
          author: formData.get("author") as string,
          genre: formData.get("genre") as string,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      toast({ title: "Book updated successfully" });
      setEditingBook(null);
    },
    onError: () => {
      toast({ title: "Failed to update book", variant: "destructive" });
    },
  });

  const deleteBookMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("books").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      toast({ title: "Book deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete book", variant: "destructive" });
    },
  });

  const handleAddBook = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    addBookMutation.mutate(formData);
  };

  const handleUpdateBook = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingBook) return;
    const formData = new FormData(e.currentTarget);
    updateBookMutation.mutate({ id: editingBook.id, formData });
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading books...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Books Inventory</h2>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2" size={16} />
              Add Book
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Book</DialogTitle>
              <DialogDescription>Enter the details of the new book</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddBook} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="author">Author</Label>
                <Input id="author" name="author" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="genre">Genre</Label>
                <Input id="genre" name="genre" required />
              </div>
              <Button type="submit" className="w-full">Add Book</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {books?.map((book) => (
          <Card key={book.id}>
            <CardHeader>
              <CardTitle className="text-lg">{book.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-1">by {book.author}</p>
              <p className="text-sm text-muted-foreground mb-2">Genre: {book.genre}</p>
              <p className={`text-sm mb-4 ${book.available ? "text-green-600" : "text-red-600"}`}>
                {book.available ? "Available" : "Borrowed"}
              </p>
              <div className="flex gap-2">
                <Dialog open={editingBook?.id === book.id} onOpenChange={(open) => !open && setEditingBook(null)}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" onClick={() => setEditingBook(book)}>
                      <Pencil size={14} />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Book</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpdateBook} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-title">Title</Label>
                        <Input id="edit-title" name="title" defaultValue={book.title} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-author">Author</Label>
                        <Input id="edit-author" name="author" defaultValue={book.author} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-genre">Genre</Label>
                        <Input id="edit-genre" name="genre" defaultValue={book.genre} required />
                      </div>
                      <Button type="submit" className="w-full">Update Book</Button>
                    </form>
                  </DialogContent>
                </Dialog>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteBookMutation.mutate(book.id)}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ManageBooks;
