<script type="text/javascript" src="/vendor/pixi/pixinew.js"></script>
<script type="text/javascript" src="/vendor/pixi/pixi-filters.js"></script>
<script type="text/javascript" src="/vendor/victor/victor.js"></script>
<script src="/vendor/jquery/dist/jquery.js"></script>

<?php function loadFolder($path) {
?>
    <script type="text/javascript">
    <?
        foreach (glob($path) as $file)
        {
            readfile($file);
        }
    ?>
    </script>
<?    
} ?>

<? loadFolder('js/*.js'); ?>
<? loadFolder('js/ai/*.js'); ?>
<? loadFolder('js/ship/*.js'); ?>
<? loadFolder('js/tokens/*.js'); ?>
<? loadFolder('js/tokens/tokenTypes/*.js'); ?>