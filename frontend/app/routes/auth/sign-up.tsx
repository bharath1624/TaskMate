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
import { useSignUpMutation } from "@/hooks/use-auth";
import { signUpSchema } from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { z } from "zod";

export type SignupFormData = z.infer<typeof signUpSchema>;

const SignUp = () => {
    const navigate = useNavigate();
    const form = useForm<SignupFormData>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const { mutate, isPending } = useSignUpMutation();
    const handleOnSubmit = (values: SignupFormData) => {
        mutate(values, {
            onSuccess: () => {
                toast.success("Email Verification Required", {
                    description:
                        "Please check your email for a verification link. If you don't see it, please check your spam folder.",
                });

                form.reset();
                navigate("/sign-in");
            },
            onError: (error: any) => {
                const errorMessage =
                    error.response?.data?.message || "An error occurred";
                console.log(error);
                toast.error(errorMessage);
            },
        });
    }
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-muted/40 p-4">
            <Card className="max-w-md w-full shadow-xl">
                <CardHeader className="text-center mb-5">
                    <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">
                        To continue
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
                                            <Input
                                                type="email"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Full Name</FormLabel>
                                        <FormControl>
                                            <Input type="text"  {...field} />
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
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirm Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" className="w-full" disabled={isPending}>
                                {isPending ? "Signing up..." : "Sign up"}
                            </Button>
                        </form>
                    </Form>

                    <CardFooter className="flex items-center justify-center mt-6">
                        <div className="flex items-center justify-center">
                            <p className="text-sm text-muted-foreground">
                                Already have an account?<Link to="/sign-in">Sign in</Link>
                            </p>
                        </div>
                    </CardFooter>
                </CardContent>
            </Card>
        </div>
    );
};

export default SignUp;