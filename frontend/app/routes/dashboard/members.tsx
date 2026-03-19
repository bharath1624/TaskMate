import { Loader } from "@/components/loader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetMyTasksQuery } from "@/hooks/use-task";
import { useGetWorkspaceDetailsQuery } from "@/hooks/use-workspace";
import { cn } from "@/lib/utils";
import { useAuth } from "@/provider/auth-context";
import type { Task, Workspace } from "@/types";
import { format } from "date-fns";
import { ArrowUpRight, CheckCircle, Clock, FilterIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";

const Members = () => {
    const { user } = useAuth();

    const [searchParams, setSearchParams] = useSearchParams();

    const workspaceId = searchParams.get("workspaceId");
    const initialSearch = searchParams.get("search") || "";
    const [search, setSearch] = useState<string>(initialSearch);
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;


    useEffect(() => {
        const params: Record<string, string> = {};

        searchParams.forEach((value, key) => {
            params[key] = value;
        });

        params.search = search;

        setSearchParams(params, { replace: true });
    }, [search]);

    useEffect(() => {
        const urlSearch = searchParams.get("search") || "";
        if (urlSearch !== search) setSearch(urlSearch);
    }, [searchParams]);

    const { data, isLoading } = useGetWorkspaceDetailsQuery(workspaceId!) as {
        data: Workspace;
        isLoading: boolean;
    };

    if (isLoading)
        return (
            <div>
                <Loader />
            </div>
        );

    if (!data || !workspaceId) return <div>No workspace found</div>;

    const filteredMembers = data?.members
        ?.filter((member) => member.user) // remove null users
        .filter(
            (member) =>
                member.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
                member.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
                member.role?.toLowerCase().includes(search.toLowerCase())
        ) || [];


    const getRoleBadgeStyle = (role?: string) => {
        if (role === "owner") {
            return {
                backgroundColor: "#ef4444", // bright red
                color: "#ffffff",
            };
        }

        if (role === "admin") {
            return {
                backgroundColor: "#8b5cf6", // bright purple
                color: "#ffffff",
            };
        }

        return {};
    };

    return (
        <div className="space-y-6 pt-5">
            <div className="flex items-start md:items-center justify-between">
                <h1 className="text-2xl font-bold">Workspace Members</h1>
            </div>

            <Input
                placeholder="Search members"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-md"
            />

            <Tabs defaultValue="list">
                <TabsList>
                    <TabsTrigger value="list">List View</TabsTrigger>
                    <TabsTrigger value="board">Board View</TabsTrigger>
                </TabsList>

                {/* LIST VIEW */}
                <TabsContent value="list">
                    <Card>
                        <CardHeader>
                            <CardTitle>Members</CardTitle>
                            <CardDescription>
                                {filteredMembers?.length} members in your workspace
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <div className="divide-y">
                                {filteredMembers?.map((member) => (
                                    <div
                                        key={member.user._id}
                                        className="flex flex-col md:flex-row items-center justify-between p-4 gap-3"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className="relative">
                                                <Avatar className="bg-gray-500">
                                                    <AvatarImage
                                                        src={
                                                            member.user.profilePicture
                                                                ? (member.user.profilePicture.startsWith("http")
                                                                    ? member.user.profilePicture
                                                                    : `${BACKEND_URL}${member.user.profilePicture}`)
                                                                : undefined
                                                        }
                                                    />
                                                    <AvatarFallback>
                                                        {member.user.name.charAt(0)}
                                                    </AvatarFallback>
                                                </Avatar>

                                                {user?._id === member.user._id && (
                                                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
                                                )}
                                            </div>

                                            <div>
                                                <p className="font-medium">{member.user.name}</p>

                                                <p className="text-sm text-gray-500">
                                                    {member.user.email}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-1 ml-11 md:ml-0">
                                            <Badge
                                                variant="secondary"
                                                style={getRoleBadgeStyle(member.role)}
                                                className="capitalize"
                                            >
                                                {member.role}
                                            </Badge>

                                            <Badge variant={"outline"}>{data.name}</Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* BOARD VIEW */}
                <TabsContent value="board">
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filteredMembers?.map((member) => (
                            <Card key={member.user._id} className="">
                                <CardContent className="p-6 flex flex-col items-center text-center">
                                    <div className="relative mb-4">
                                        <Avatar className="bg-gray-500 size-20">
                                            <AvatarImage
                                                src={
                                                    member.user.profilePicture
                                                        ? (member.user.profilePicture.startsWith("http")
                                                            ? member.user.profilePicture
                                                            : `${BACKEND_URL}${member.user.profilePicture}`)
                                                        : undefined
                                                }
                                            />
                                            <AvatarFallback className="uppercase">
                                                {member.user.name.substring(0, 2)}
                                            </AvatarFallback>
                                        </Avatar>

                                        {user?._id === member.user._id && (
                                            <span className="absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-background" />
                                        )}
                                    </div>

                                    <h3 className="text-lg font-medium mb-2">
                                        {member.user.name}
                                    </h3>

                                    <p className="text-sm text-gray-500 mb-4">
                                        {member.user.email}
                                    </p>

                                    <Badge
                                        variant="secondary"
                                        style={getRoleBadgeStyle(member.role)}
                                    >
                                        {member.role}
                                    </Badge>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default Members;