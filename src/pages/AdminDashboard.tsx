import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, LogOut, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ManageBooks from "@/components/admin/ManageBooks";
import BorrowedBooks from "@/components/admin/BorrowedBooks";

const AdminDashboard = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <BookOpen className="text-primary" size={32} />
            <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
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
            <CardTitle>Welcome, Admin</CardTitle>
            <CardDescription>{user?.email}</CardDescription>
          </CardHeader>
        </Card>

        <Tabs defaultValue="books" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="books">
              <BookOpen className="mr-2" size={16} />
              Manage Books
            </TabsTrigger>
            <TabsTrigger value="borrowed">
              <Users className="mr-2" size={16} />
              Borrowed Books
            </TabsTrigger>
          </TabsList>
          <TabsContent value="books">
            <ManageBooks />
          </TabsContent>
          <TabsContent value="borrowed">
            <BorrowedBooks />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
