import { Switch, Route } from "wouter";
import { Toaster } from "./components/ui/toaster";
import { AuthProvider } from "./lib/auth";
import Login from "./pages/login";
import Register from "./pages/register";
import Dashboard from "./pages/dashboard";
import Posts from "./pages/posts";
import PostForm from "./pages/post-form";

function App() {
  return (
    <AuthProvider>
      <Toaster />
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/" component={Dashboard} />
        <Route path="/posts" component={Posts} />
        <Route path="/posts/new" component={PostForm} />
        <Route path="/posts/edit/:id" component={PostForm} />
        <Route>
          <div className="flex items-center justify-center min-h-screen">
            <h1 className="text-2xl">404 - Page Not Found</h1>
          </div>
        </Route>
      </Switch>
    </AuthProvider>
  );
}

export default App;