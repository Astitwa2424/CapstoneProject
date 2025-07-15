"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useFormState, useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CreditCard, Loader2 } from "lucide-react"
import { addPaymentMethod } from "@/app/customer/actions"
import { toast } from "sonner"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Adding...
        </>
      ) : (
        "Add Card"
      )}
    </Button>
  )
}

interface AddPaymentMethodDialogProps {
  onSuccess?: () => void
  children: React.ReactNode
}

export default function AddPaymentMethodDialog({ onSuccess, children }: AddPaymentMethodDialogProps) {
  const [open, setOpen] = useState(false)
  const [state, formAction] = useFormState(addPaymentMethod, null)

  useEffect(() => {
    if (state?.success) {
      toast.success("Payment method added successfully!")
      onSuccess?.()
      setOpen(false)
    }
    if (state?.error) {
      const errorMessage = typeof state.error === "string" ? state.error : state.error._errors?.[0]
      if (errorMessage) {
        toast.error(errorMessage)
      }
    }
  }, [state, onSuccess])

  const formatCardNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "")
    value = value.substring(0, 16)
    const groups = value.match(/.{1,4}/g)
    e.target.value = groups ? groups.join(" ") : ""
  }

  const formatExpiryDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "")
    if (value.length > 2) {
      value = `${value.substring(0, 2)}/${value.substring(2, 4)}`
    }
    e.target.value = value
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Add Payment Method
          </DialogTitle>
          <DialogDescription>Your card details are securely handled by Stripe.</DialogDescription>
        </DialogHeader>
        <form action={formAction}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="cardHolder">Cardholder Name</Label>
              <Input id="cardHolder" name="cardHolder" placeholder="John Doe" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                name="cardNumber"
                placeholder="0000 0000 0000 0000"
                required
                onChange={formatCardNumber}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input id="expiryDate" name="expiryDate" placeholder="MM/YY" required onChange={formatExpiryDate} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  name="cvv"
                  placeholder="123"
                  maxLength={4}
                  required
                  onChange={(e) => {
                    e.target.value = e.target.value.replace(/\D/g, "")
                  }}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
