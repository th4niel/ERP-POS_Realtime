import { Button } from "@/components/ui/button";
import { DarkmodeToggle } from "@/components/common/darkmode-toggle";
import { Input } from "@/components/ui/input";

export default function Home() {
  return (
    <div>
      <Input />
      <Button className="dark:bg-amber-300"> Confirm</Button>
      <DarkmodeToggle/>
    </div>
  );
}
