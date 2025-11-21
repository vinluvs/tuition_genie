"use client";

import { useForm, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useCreateClass } from "@/hooks/classes";
import { CreateClassPayload } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
}
  from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const DAYS_OF_WEEK = [
  { id: "Mon", label: "Monday" },
  { id: "Tue", label: "Tuesday" },
  { id: "Wed", label: "Wednesday" },
  { id: "Thu", label: "Thursday" },
  { id: "Fri", label: "Friday" },
  { id: "Sat", label: "Saturday" },
  { id: "Sun", label: "Sunday" },
] as const;

const formSchema = z.object({
  name: z.string().min(1, "Class name is required").max(100, "Class name is too long"),
  instructor: z.string().optional(),
  feePerMonthINR: z.coerce
    .number()
    .min(0, "Fee must be a positive number")
    .int("Fee must be a whole number"),
  days: z.array(z.string()).optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  timezone: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function AddClassModal({ isOpen, onClose }: Props) {
  const createClassMutation = useCreateClass();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as Resolver<FormValues>,
    defaultValues: {
      name: "",
      instructor: "",
      feePerMonthINR: 0,
      days: [],
      startTime: "",
      endTime: "",
      timezone: "Asia/Kolkata",
    },
  });

  const onSubmit = (values: FormValues) => {
    const payload: CreateClassPayload = {
      name: values.name,
      instructor: values.instructor || undefined,
      feePerMonthINR: values.feePerMonthINR,
    };

    // Only add schedule if at least one schedule field is filled
    if (
      (values.days && values.days.length > 0) ||
      values.startTime ||
      values.endTime ||
      values.timezone
    ) {
      payload.schedule = {
        days: values.days && values.days.length > 0 ? values.days : undefined,
        startTime: values.startTime || undefined,
        endTime: values.endTime || undefined,
        timezone: values.timezone || undefined,
      };
    }

    createClassMutation.mutate(payload, {
      onSuccess: () => {
        toast.success("Class created successfully!");
        form.reset();
        onClose();
      },
      onError: (error) => {
        toast.error(`Failed to create class: ${error.message} `);
      },
    });
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Class</DialogTitle>
          <DialogDescription>
            Create a new class with schedule and fee information.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Basic Information</h3>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Grade 10 Physics"
                        {...field}
                        disabled={createClassMutation.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="instructor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instructor Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Mr. Smith"
                        {...field}
                        disabled={createClassMutation.isPending}
                      />
                    </FormControl>
                    <FormDescription>Optional</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="feePerMonthINR"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fee per Month (INR) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g., 5000"
                        {...field}
                        disabled={createClassMutation.isPending}
                        min="0"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Schedule Information */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium">Schedule</h3>
                <p className="text-sm text-muted-foreground">
                  All schedule fields are optional
                </p>
              </div>

              <FormField
                control={form.control}
                name="days"
                render={() => (
                  <FormItem>
                    <FormLabel>Days of Week</FormLabel>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                      {DAYS_OF_WEEK.map((day) => (
                        <FormField
                          key={day.id}
                          control={form.control}
                          name="days"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={day.id}
                                className="flex flex-row items-center space-x-2 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(day.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...(field.value || []), day.id])
                                        : field.onChange(
                                          field.value?.filter((value) => value !== day.id)
                                        );
                                    }}
                                    disabled={createClassMutation.isPending}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal cursor-pointer">
                                  {day.label}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <FormControl>
                        <Input
                          type="time"
                          {...field}
                          disabled={createClassMutation.isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time</FormLabel>
                      <FormControl>
                        <Input
                          type="time"
                          {...field}
                          disabled={createClassMutation.isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="timezone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Timezone</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={createClassMutation.isPending}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                        <SelectItem value="America/New_York">
                          America/New_York (EST)
                        </SelectItem>
                        <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                        <SelectItem value="Asia/Dubai">Asia/Dubai (GST)</SelectItem>
                        <SelectItem value="Asia/Singapore">
                          Asia/Singapore (SGT)
                        </SelectItem>
                        <SelectItem value="Australia/Sydney">
                          Australia/Sydney (AEDT)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={createClassMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createClassMutation.isPending}>
                {createClassMutation.isPending ? "Creating..." : "Create Class"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
