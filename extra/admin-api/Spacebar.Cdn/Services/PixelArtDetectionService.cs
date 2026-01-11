using ImageMagick;

namespace Spacebar.AdminApi.TestClient.Services.Services;

public class PixelArtDetectionService {
    public bool IsPixelArt<T>(IMagickImage<T> img) where T : struct, IConvertible {
        // Simple heuristic: if the image has a limited color palette and sharp edges, consider it pixel art
        var colorCount = img.Histogram().Count;
        var edgeThreshold = 20; // Arbitrary threshold for edge detection

        using var edgeImg = img.Clone();
        // noise reduction
        edgeImg.MedianFilter();
        edgeImg.Edge(edgeThreshold);
        var edgePixels = edgeImg.Histogram().Count(kv => kv.Value > 0);

        bool isPixelArt = colorCount < 64 && edgePixels > (img.Width * img.Height) / 10;
        Console.WriteLine($"IsPixelArt check: colors={colorCount}, edgePixels={edgePixels}, width={img.Width}, height={img.Height} => isPixelArt={isPixelArt}");
        return isPixelArt;
    }

    public bool IsCartoonArt<T>(IMagickImage<T> img) where T : struct, IConvertible {
        // Simple heuristic: if the image has a limited color palette and smooth edges, consider it cartoon art
        var colorCount = img.Histogram().Count;
        var edgeThreshold = 5; // Lower threshold for smoother edges
        using var edgeImg = img.Clone();
        // noise reduction
        edgeImg.MedianFilter();
        edgeImg.Edge(edgeThreshold);
        var edgePixels = edgeImg.Histogram().Count(kv => kv.Value > 0);
        bool isCartoonArt = colorCount < 128 && edgePixels < (img.Width * img.Height) / 20;
        Console.WriteLine($"IsCartoonArt check: colors={colorCount}, edgePixels={edgePixels}, width={img.Width}, height={img.Height} => isCartoonArt={isCartoonArt}");
        return isCartoonArt;
    }

    public IMagickImage<T> RenderEdges<T>(IMagickImage<T> img, double radius = 1) where T : struct, IConvertible {
        var edgeImg = img.Clone();
        // edgeImg.Edge(radius);
        edgeImg.WaveletDenoise(new Percentage(50));
        edgeImg.CannyEdge(radius, sigma: 0.75, lower: new Percentage(10), upper: new Percentage(30));
        return edgeImg;
    }

    public bool IsPixelArt(MagickImageCollection img) {
        Console.WriteLine($"Checking IsPixelArt for image with {img.Count} frames");
        return img.All(IsPixelArt);
    }

    public bool IsCartoonArt(MagickImageCollection img) {
        Console.WriteLine($"Checking IsCartoonArt for image with {img.Count} frames");
        return img.All(IsCartoonArt);
    }

    public MagickImageCollection RenderEdges(MagickImageCollection img, double radius = 1) {
        var edges = img.Clone();
        if (edges.Count == 1) {
            edges[0] = RenderEdges(edges[0], radius);
            // RenderEdges(edges[0], radius);
            return (MagickImageCollection)edges;
        }

        Parallel.ForEach(img, frame => {
            var t = new Thread(() => {
                var edged = RenderEdges(frame, radius);
                var idx = img.IndexOf(frame);
                // while (edges.Count < idx) {
                //     Console.WriteLine($"Waiting to insert edge frame {idx}/{img.Count} (radius={radius}, size={frame.Width}x{frame.Height})");
                //     Thread.Sleep(1000);
                // }
                //
                lock (edges) edges[idx] = edged;
                //
                Console.WriteLine($"Edged frame {idx}/{img.Count} (radius={radius}, size={frame.Width}x{frame.Height})");
            });
            t.Start();
            t.Join();
        });
        return (MagickImageCollection)edges;
    }
}