import { Avatar } from "@zensloom/ui";
import type { ImageUpload } from "@zensloom/web-domain";

interface SignedImageUrlProps {
	image: ImageUpload.ImageUrl | null | undefined;
	name: string;
	className?: string;
	letterClass?: string;
}

export function SignedImageUrl({
	image,
	name,
	className,
	letterClass,
}: SignedImageUrlProps) {
	return (
		<Avatar
			name={name}
			imageUrl={image}
			className={className}
			letterClass={letterClass}
		/>
	);
}
