import { Card } from "@/components/ui/card"
import React from 'react'
import Heading from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useNavigate, useParams } from "react-router";


const GrievanceDetails = () => {
    // const { id } = useParams();
    const navigate = useNavigate();


    return (
        <div className="p-2">
            <Card className="rounded-md mt-2 mx-2 p-6">
                <Button variant="ghost" onClick={() => navigate(-1)} className="w-auto">
                    <ChevronLeft className="w-4 h-4" />
                    <span>Back</span>
                </Button>

                <Heading type={5}>Title: Title</Heading>
                <div className="flex items-center gap-2">
                    <Label className="font-semibold">Category:</Label>

                </div>

                <Heading type={6} className="font-semibold mb-2 mt-6">Description</Heading>
                {/* <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: grievance.description }} /> */}


                <div className="flex gap-4 mt-6">
                    <Button>Comment</Button>
                    <Button >Submit</Button>
                    <Button >Appeal</Button>
                </div>
            </Card>
        </div>
    )
}

export default GrievanceDetails