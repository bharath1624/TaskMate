import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useLoginMutation } from "@/hooks/use-auth";
import { signInSchema } from "@/lib/schema";
import { useAuth } from "@/provider/auth-context";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { z } from "zod";

type SigninFormData = z.infer<typeof signInSchema>;

const SignIn = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const form = useForm<SigninFormData>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });
    const { mutate, isPending } = useLoginMutation();

    const handleOnSubmit = (values: SigninFormData) => {
        mutate(values, {
            onSuccess: async (data: any) => {
                // 1. Save session (This triggers AuthProvider to handle invites)
                await login(data);

                toast.success("Welcome back!");

                // 2. Simply navigate. AuthProvider will detect the inviteToken 
                // in localStorage and redirect to the workspace automatically.
                navigate("/dashboard");
            },
            onError: (error: any) => {
                const errorMessage = error.response?.data?.message || "Login failed";
                toast.error(errorMessage);
            },
        });
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-muted/40 p-4">
            <Card className="max-w-md w-full shadow-xl">
                <CardHeader className="text-center mb-5">
                    <CardTitle className="text-2xl font-bold text-blue-600">
                        Welcome back
                    </CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">
                        Sign in to your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(handleOnSubmit)}
                            className="space-y-6"
                        >
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email Address</FormLabel>
                                        <FormControl>
                                            <Input type="email" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center justify-between">
                                            <FormLabel>Password</FormLabel>
                                            <Link
                                                to="/forgot-password"
                                                className="text-sm text-blue-600"
                                            >
                                                Forgot password?
                                            </Link>
                                        </div>
                                        <FormControl>
                                            <Input type="password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" disabled={isPending} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                                {isPending ? <Loader2 className="w-4 h-4 mr-2" /> : "Sign in"}
                            </Button>
                        </form>
                    </Form>

                    <CardFooter className="flex items-center justify-center mt-6">
                        <div className="flex items-center justify-center">
                            <p className="text-sm text-muted-foreground">
                                Don&apos;t have an account?{" "}
                                <Link
                                    to="/sign-up"
                                    className="font-medium text-foreground hover:underline"
                                >
                                    Sign up
                                </Link>
                            </p>
                        </div>
                    </CardFooter>
                </CardContent>
            </Card>
        </div>
    );
};

export default SignIn;