import { FieldValues, Path, UseFormReturn } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import Image from 'next/image';

export default function FormInput<T extends FieldValues>({
  form,
  name,
  label,
  preview,
  setPreview,
}: {
  form: UseFormReturn<T>;
  name: Path<T>;
  label: string;
  preview?: {
    file: File;
    displayUrl: string;
  };
  setPreview?: (preview: { file: File; displayUrl: string }) => void;
}) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field: { onChange, ...rest } }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
             <div className='flex items-center gap-2'>
                {preview?.displayUrl ? (
                    <Image src={preview.displayUrl} width={40} height={40} alt='preview' className='w-9 aspect-square rounded-lg'/>
                ): (
                    <div className='w-10 aspect-square bg-accent rounded-lg flex items-center justify-center'></div>
                )}
             </div>
          </FormControl>
          <FormMessage className="text-xs" />
        </FormItem>
      )}
    />
  );
}