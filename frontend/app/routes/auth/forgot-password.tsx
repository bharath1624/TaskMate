import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForgotPasswordMutation } from "@/hooks/use-auth";
import { forgotPasswordSchema } from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router";
import { toast } from "sonner";
import type { z } from "zod";

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

const ForgotPassword = () => {
    const [isSuccess, setIsSuccess] = useState(false);

    const { mutate: forgotPassword, isPending } = useForgotPasswordMutation();

    const form = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: "",
        },
    });

    const onSubmit = (data: ForgotPasswordFormData) => {
        forgotPassword(data, {
            onSuccess: () => {
                setIsSuccess(true);
            },
            onError: (error: any) => {
                const errorMessage = error.response?.data?.message;
                console.log(error);
                toast.error(errorMessage);
            },
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4">
            <div className="w-full max-w-md space-y-8">
                <div className="flex flex-col items-center justify-center space-y-1 text-center">
                    <h1 className="text-2xl font-bold  text-blue-600">Forgot Password</h1>
                    <p className="text-sm text-muted-foreground">
                        Enter email to get reset link
                    </p>
                </div>

                <Card className="max-w-md w-full shadow-xl border-muted px-2 md:px-4">
                    <CardHeader>
                        <Link
                            to="/sign-in"
                            className="flex items-center gap-2 text-sm font-medium text-foreground hover:opacity-80 transition-opacity"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Back to sign in</span>
                        </Link>

                    </CardHeader>

                    <CardContent>
                        {isSuccess ? (
                            <div className="flex flex-col items-center justify-center text-center space-y-3 py-6">
                                <CheckCircle className="w-12 h-12 text-green-500" />
                                <h2 className="text-xl font-semibold">
                                    Email sent successfully
                                </h2>
                                <p className="text-sm text-muted-foreground max-w-sm">
                                    We’ve sent a password reset link to your email.
                                    Please check your inbox.
                                </p>
                            </div>
                        ) : (
                            <>
                                <Form {...form}>
                                    <form
                                        onSubmit={form.handleSubmit(onSubmit)}
                                        className="space-y-5"
                                    >
                                        <FormField
                                            name="email"
                                            control={form.control}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Email Address</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="Enter your email" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <Button
                                            type="submit"
                                            className="w-full  bg-blue-600  hover:bg-blue-700  text-white"
                                            disabled={isPending}
                                        >
                                            {isPending ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                "Reset Password"
                                            )}
                                        </Button>
                                    </form>
                                </Form>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ForgotPassword;