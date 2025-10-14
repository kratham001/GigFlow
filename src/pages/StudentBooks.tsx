import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, LogOut } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AvailableBooks from "@/components/student/AvailableBooks";
import MyBorrowedBooks from "@/components/student/MyBorrowedBooks";

const StudentBooks = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <BookOpen className="text-primary" size={32} />
            <h1 className="text-2xl font-bold text-foreground">Library</h1>
          </div>
          <Button onClick={signOut} variant="outline">
            <LogOut className="mr-2" size={16} />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Welcome to the Library</CardTitle>
            <CardDescription>{user?.email}</CardDescription>
          </CardHeader>
        </Card>

        <Tabs defaultValue="available" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="available">
              <BookOpen className="mr-2" size={16} />
              Available Books
            </TabsTrigger>
            <TabsTrigger value="myborrowed">
              My Borrowed Books
            </TabsTrigger>
          </TabsList>
          <TabsContent value="available">
            <AvailableBooks />
          </TabsContent>
          <TabsContent value="myborrowed">
            <MyBorrowedBooks />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default StudentBooks;
